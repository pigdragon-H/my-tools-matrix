// @profile B
// Profile B · 法律-工具 · MinimumWageCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—";

// 2024 台灣基本工資（勞動部公告）
const MIN_MONTHLY = 27470;
const MIN_HOURLY = 183;
const STD_MONTH_HOURS = 240;

type CheckMode = "monthly" | "hourly" | "shortfall";

const bands = [
  { key: "monthly", range: "27,470/mo", label: { zh: "月薪基準", en: "Monthly base" }, desc: { zh: "全時受僱者月薪不得低於 27,470 元;這是法定下限,適用一般全職人員。", en: "Full-time monthly pay must not be below NT$27,470 — the legal floor for full-time staff." } },
  { key: "hourly", range: "183/hr", label: { zh: "時薪基準", en: "Hourly base" }, desc: { zh: "部分工時時薪不得低於 183 元;兼職、工讀適用,各自為獨立下限。", en: "Part-time hourly pay must not be below NT$183 — applies to part-timers, its own floor." } },
  { key: "shortfall", range: "top-up", label: { zh: "補足差額", en: "Shortfall" }, desc: { zh: "薪資低於基準時,雇主須補足至法定最低;差額 = 基準 − 實領。", en: "When pay is below the base, the employer must top up to the legal minimum; gap = base − actual." } },
  { key: "overtime", range: "Art. 24", label: { zh: "加班分開算", en: "Overtime apart" }, desc: { zh: "基本工資僅涵蓋正常工時,加班費須依勞基法第 24 條另計,不得稀釋進本薪。", en: "The minimum wage covers normal hours only; overtime is calculated separately under Article 24." } },
  { key: "penalty", range: "20k-1M", label: { zh: "罰則", en: "Penalty" }, desc: { zh: "給付低於基本工資,依第 79 條可處 2 萬至 100 萬元罰鍰,並須補足差額。", en: "Paying below the minimum carries a NT$20,000–1,000,000 fine under Article 79, plus the top-up." } },
  { key: "review", range: "yearly", label: { zh: "每年審議", en: "Annual review" }, desc: { zh: "基本工資由審議會每年檢討,通常於年初生效;本工具採最新公告值。", en: "The minimum wage is reviewed yearly by the committee, usually effective at year start." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "加班費計算器", en: "Overtime Calculator" }, href: "/tools/legal/overtime-calculator" },
  { label: { zh: "工時計算器", en: "Working Hours" }, href: "/tools/legal/working-hours-calculator" },
  { label: { zh: "資遣費計算器", en: "Severance Pay" }, href: "/tools/legal/severance-pay-calculator" },
  { label: { zh: "特休計算器", en: "Annual Leave" }, href: "/tools/legal/annual-leave-calculator" },
];

const ui = {
  zh: {
    badge: "勞動法令 · 合規試算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Minimum Wage Calculator · 最低工資計算器", subtitle: "比對月薪、時薪是否達到法定基本工資門檻,並計算補足差額",
    intro: "本工具以勞動部公告的最新基本工資（月薪 27,470 元、時薪 183 元）為基準,協助勞工與雇主快速確認薪資是否合規,並計算需補足的差額。提供月薪、時薪與差額換算三種模式,所有試算都在瀏覽器本機完成,結果僅供參考。",
    trustNoteLabel: "注意事項：", trustNote: "基本工資門檻依勞動部最新公告為準;本工具採月薪 27,470、時薪 183。試算結果僅供參考,正式爭議請以主管機關函釋為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例薪資即時判定", examplePreview: "差額", examplePerson: "判定", flowDemo: "基準", fillExample: "載入範例 · 月薪 26,000", previewActivePath: "載入範例 · 時薪 170",
    examplesCalculator: "範例 → 計算器", enterValues: "選擇模式並輸入您的薪資", examplesHelper: "先用範例理解合規判定邏輯,再選擇月薪、時薪或差額模式,輸入您的實領薪資,即可看出是否達標與需補足的金額。",
    metric: "月薪/時薪", imperial: "差額換算", exampleCards: "範例卡", baselineExample: "月薪 · 26,000", activeExample: "時薪 · 170", calculator: "計算器",
    modeLabel: "您的薪資", countLabel: "月工時", formatLabel: "模式", regenerate: "重新判定", copyAll: "複製判定結果",
    resultCard: "合規判定結果", estimatedTdee: "差額", monthlyEquiv: "基準", weeklyEquiv: "實領", dailyEquiv: "判定", effectiveHours: "差額", fatLossTarget: "差額",
    outputLabel: "合規判定摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格基本工資合規矩陣", tdeeMatrixNote: "L7 固定六格,列出基本工資的各項基準與規則;這是參考說明,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把合規判定整合進勞資溝通", conversionNote: "L9 會連動目前判定結果,顯示基準、實領與差額,協助您判斷是否需要補足或申訴。",
    progressInsight: "進度洞察卡", possibleTarget: "目前薪資定位", dailyGap: "差額", weeklyTrend: "實領", motivation: "動力卡", keepMomentum: "從單次判定走向完整勞動權益確認",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次判定帶進您的勞資紀錄", journeyHint: "每次更換薪資或切換模式時重新判定,並把結果記錄到薪資單或勞資溝通紀錄。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用加班費計算器確認加班是否另計", nextActionItem2: "用工時計算器檢查每月工時是否超標", nextActionItem3: "用資遣費計算器評估離職相關權益",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "選模式 → 輸薪資 → 比基準 → 算差額", bmrStep: "選模式", deficitStep: "輸薪資", trendStep: "比基準", mealStep: "算差額",
    knowledge: "知識", knowledgeTitle: "基本工資合規的意義", definition: "定義", definitionText: "基本工資是雇主必須支付的法定下限,分為月薪與時薪兩種基準,全時與部分工時勞工皆適用。",
    formula: "公式", formulaText: "月薪模式比對 27,470、時薪模式比對 183;差額 = 基準 − 實領（不為負);差額模式以月薪換算實際時薪再與 183 比對。",
    limitations: "限制", limitationsText: "本工具採最新公告基本工資,實際門檻以勞動部公告為準;不含加班費、津貼與特殊行業規定,單次判定僅供參考。",
    interpretation: "解讀", interpretationText: "薪資達到或高於基準即為合規;低於基準時顯示差額,雇主須補足至法定最低,並另計加班費。",
    context: "脈絡", contextText: "了解基本工資合規可協助勞工確認權益、雇主避免裁罰,並在勞資溝通時有客觀依據。",
    example: "範例", exampleText: "月薪模式輸入 26,000,工具會比對基準 27,470,判定不合規,並顯示需補足差額 1,470 元。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "勞動權益工作流程的下一步工具", premiumTitle: "專業版勞動合規工具包", premiumText: "解鎖歷年基本工資對照表、加班費自動換算與申訴函範本。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅依公告基本工資做合規判定與差額試算,屬參考用途;不取代主管機關的正式認定。", relatedTools: "相關工具", relatedToolsText: "加班費計算器 · 工時計算器 · 資遣費計算器 · 特休計算器", references: "參考資料", referencesText: "勞動部基本工資公告;勞動基準法第 21、24、79 條;月薪與時薪基準;補足差額與罰則規定。",
    q1: "基本工資多久調整一次？", a1: "通常由基本工資審議會每年檢討,並多於年初生效;本工具採最新公告的月薪與時薪數值作為比對基準。",
    q2: "雇主可以挑時薪或月薪較低者給嗎？", a2: "不行。月薪與時薪是各自獨立的下限,雇主須依僱用型態適用對應基準,且不得低於該基準。",
    q3: "薪資低於基本工資怎麼辦？", a3: "雇主須補足差額至法定最低,勞工可向當地勞工局申訴或請求補足;雇主另依第 79 條面臨罰鍰。",
    q4: "基本工資有含加班費嗎？", a4: "沒有。基本工資僅涵蓋正常工時的報酬,加班費須依勞基法第 24 條另計,不能稀釋進本薪。",
    q5: "差額模式怎麼算？", a5: "差額模式把月薪除以月工時換算成實際時薪,再與 183 比對;若低於 183,差額 = (183 − 實際時薪) × 月工時。",
    q6: "這個工具會上傳我的薪資嗎？", a6: "不會。所有合規判定與差額計算都在您的瀏覽器本機完成,輸入的薪資不會上傳到任何伺服器。",
  },
  en: {
    badge: "Labor law · Compliance · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Minimum Wage Calculator", subtitle: "Check whether monthly or hourly pay meets the statutory minimum wage and compute any shortfall",
    intro: "This tool uses the latest official minimum wage (NT$27,470/month, NT$183/hour) as the baseline to help employees and employers quickly verify pay compliance and compute the shortfall. It offers monthly, hourly, and shortfall modes, and all calculations run locally in your browser. Results are for reference only.",
    trustNoteLabel: "Note:", trustNote: "The minimum-wage threshold follows the latest official announcement; this tool uses NT$27,470 monthly and NT$183 hourly. Results are for reference; formal disputes should follow the competent authority. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample pay and judge", examplePreview: "Shortfall", examplePerson: "Verdict", flowDemo: "Base", fillExample: "Load sample · monthly 26,000", previewActivePath: "Load sample · hourly 170",
    examplesCalculator: "Examples → Calculator", enterValues: "Pick a mode and enter your pay", examplesHelper: "Start with a sample to understand the compliance logic, then pick monthly, hourly, or shortfall mode and enter your actual pay to see whether it meets the floor and any top-up needed.",
    metric: "Monthly/Hourly", imperial: "Shortfall", exampleCards: "Example cards", baselineExample: "Monthly · 26,000", activeExample: "Hourly · 170", calculator: "Calculator",
    modeLabel: "Your pay", countLabel: "Monthly hours", formatLabel: "Mode", regenerate: "Re-judge", copyAll: "Copy verdict",
    resultCard: "Compliance result", estimatedTdee: "Shortfall", monthlyEquiv: "Base", weeklyEquiv: "Actual", dailyEquiv: "Verdict", effectiveHours: "Shortfall", fatLossTarget: "Shortfall",
    outputLabel: "Compliance summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band minimum-wage compliance matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the minimum-wage bases and rules. These are reference notes, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit the compliance verdict into labor communication", conversionNote: "L9 reflects your current verdict — base, actual, and shortfall — to help you judge whether a top-up or complaint is needed.",
    progressInsight: "Progress insight", possibleTarget: "Your current pay position", dailyGap: "Shortfall", weeklyTrend: "Actual", motivation: "Motivation", keepMomentum: "Move from a single verdict to a full labor-rights check",
    saveShareJourney: "Save / share", journeyTitle: "Take this verdict into your labor record", journeyHint: "Re-judge whenever you change the pay or switch modes, and log the result into a payslip or labor-communication record.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Overtime Calculator to confirm overtime is paid separately", nextActionItem2: "Use the Working Hours Calculator to check if monthly hours exceed the cap", nextActionItem3: "Use the Severance Pay Calculator to assess separation rights",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Pick mode → Enter pay → Compare base → Compute gap", bmrStep: "Pick mode", deficitStep: "Enter pay", trendStep: "Compare base", mealStep: "Compute gap",
    knowledge: "Knowledge", knowledgeTitle: "What minimum-wage compliance means", definition: "Definition", definitionText: "The minimum wage is the legal floor an employer must pay, split into monthly and hourly bases, applicable to both full-time and part-time workers.",
    formula: "Formula", formulaText: "Monthly mode compares 27,470; hourly mode compares 183; shortfall = base − actual (not negative); shortfall mode converts monthly pay to an effective hourly rate and compares it to 183.",
    limitations: "Limitations", limitationsText: "This tool uses the latest announced minimum wage; the actual threshold follows the official announcement. It excludes overtime, allowances, and special-industry rules, so a single verdict is indicative only.",
    interpretation: "Interpretation", interpretationText: "Pay at or above the base is compliant; below the base shows a shortfall, which the employer must top up to the legal minimum, with overtime computed separately.",
    context: "Context", contextText: "Understanding minimum-wage compliance helps employees confirm rights, employers avoid fines, and both sides have an objective basis in labor communication.",
    example: "Example", exampleText: "In monthly mode, enter 26,000; the tool compares it to the base 27,470, judges it non-compliant, and shows a top-up shortfall of NT$1,470.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a labor-rights workflow", premiumTitle: "Pro Labor Compliance Toolkit", premiumText: "Unlock multi-year minimum-wage tables, automatic overtime conversion, and complaint-letter templates.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only judges compliance and estimates the shortfall against the announced minimum wage for reference; it does not replace the competent authority's official determination.", relatedTools: "Related tools", relatedToolsText: "Overtime Calculator · Working Hours Calculator · Severance Pay Calculator · Annual Leave Calculator", references: "References", referencesText: "Ministry of Labor minimum-wage announcement; Labor Standards Act Articles 21, 24, 79; monthly and hourly bases; shortfall top-up and penalty rules.",
    q1: "How often is the minimum wage adjusted?", a1: "Usually reviewed yearly by the wage committee and typically effective at the start of the year; this tool uses the latest announced monthly and hourly figures as the baseline.",
    q2: "Can the employer pick the lower of hourly or monthly?", a2: "No. Monthly and hourly are independent floors; the employer must apply the base matching the employment type and may not pay below it.",
    q3: "What if pay is below the minimum wage?", a3: "The employer must top up to the legal minimum; the worker may file a complaint with the local labor bureau or request a top-up, and the employer faces a fine under Article 79.",
    q4: "Does the minimum wage include overtime?", a4: "No. The minimum wage covers pay for normal working hours only; overtime must be computed separately under Article 24 and cannot be diluted into the base wage.",
    q5: "How is shortfall mode calculated?", a5: "Shortfall mode divides monthly pay by monthly hours to an effective hourly rate, then compares it to 183; if below, shortfall = (183 − effective hourly) × monthly hours.",
    q6: "Does this tool upload my pay?", a6: "No. All compliance judging and shortfall calculation run locally in your browser — your entered pay is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function MinimumWageCalculator() {
  const { lang, setLang } = useLanguage();
  const [mode, setMode] = useState<CheckMode>("monthly");
  const [wage, setWage] = useState("26000");
  const [hours, setHours] = useState(String(STD_MONTH_HOURS));
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Math.max(0, Number(wage) || 0);
    const h = Math.max(1, Number(hours) || STD_MONTH_HOURS);
    if (mode === "monthly") {
      const base = MIN_MONTHLY;
      const gap = Math.max(0, base - w);
      return { base, your: w, gap, pass: w >= base };
    }
    if (mode === "hourly") {
      const base = MIN_HOURLY;
      const gap = Math.max(0, base - w);
      return { base, your: w, gap, pass: w >= base };
    }
    const effHourly = w / h;
    const gap = Math.max(0, (MIN_HOURLY - effHourly) * h);
    return { base: MIN_HOURLY * h, your: w, gap, pass: effHourly >= MIN_HOURLY };
  }, [mode, wage, hours]);

  const verdict = useMemo<LocalText>(() => result.pass ? { zh: "合規 ✅", en: "Compliant ✅" } : { zh: "未達基準 ⚠️", en: "Below minimum ⚠️" }, [result.pass]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "判定", en: "Verdict" }, l(verdict, lang)],
      [{ zh: "基準", en: "Base" }, fmt(result.base)],
      [{ zh: "實領", en: "Actual" }, fmt(result.your)],
      [{ zh: "差額", en: "Shortfall" }, fmt(result.gap)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, verdict, lang]);

  function fillSolid() { setMode("monthly"); setWage("26000"); }
  function fillHighSalary() { setMode("hourly"); setWage("170"); }

  const activeBand = bands.find(b => b.key === (mode === "shortfall" ? "shortfall" : mode)) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fmt(result.gap)}</div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.base)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{fmt(result.your)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.pass ? "✓" : "✗"}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode !== "shortfall" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("monthly")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "shortfall" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("shortfall")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">mo</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "月薪 26,000 vs 基準 27,470" : "Monthly 26,000 vs base 27,470"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">hr</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "時薪 170 vs 基準 183" : "Hourly 170 vs base 183"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2">{(["monthly","hourly","shortfall"] as CheckMode[]).map((m) => <button key={m} className={`rounded-xl px-2 py-2 text-xs font-black ${mode === m ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode(m)}>{m === "monthly" ? (lang === "zh" ? "月薪" : "Monthly") : m === "hourly" ? (lang === "zh" ? "時薪" : "Hourly") : (lang === "zh" ? "差額" : "Shortfall")}</button>)}</div><label className="block text-sm font-black text-slate-700">{t.modeLabel}<input type="number" min="0" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={wage} onChange={(e) => setWage(e.target.value)} /></label>{mode === "shortfall" && <label className="block text-sm font-black text-emerald-700">{t.countLabel}<input type="number" min="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={hours} onChange={(e) => setHours(e.target.value)} /></label>}</div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-6xl font-black tracking-tight text-slate-950">{fmt(result.gap)}<span className="text-2xl">{lang === "zh" ? " 元差額" : " gap"}</span></div><div className={`mt-2 rounded-full px-4 py-2 text-sm font-black ${result.pass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{fmt(result.base)}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "基準" : "base"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">NT$</div><p className="mt-2 text-2xl font-black text-emerald-950">{fmt(result.your)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "實領" : "actual"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">NT$</div><p className="mt-2 text-2xl font-black text-blue-950">{fmt(result.base)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "基準" : "base"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.estimatedTdee}</div><div className="mt-1 text-xs font-black text-slate-700">NT$</div><p className="mt-2 text-2xl font-black text-slate-950">{fmt(result.gap)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="minimum-wage-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "判定" : "Verdict"}</div><div className="mt-1 text-2xl font-black">{result.pass ? "✓" : "✗"}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-2xl font-black text-amber-950">{fmt(result.your)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-2xl font-black text-emerald-950">{fmt(result.gap)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "選模式" : "Mode", note: t.bmrStep }, { label: lang === "zh" ? "輸薪資" : "Pay", note: t.deficitStep }, { label: lang === "zh" ? "比基準" : "Compare", note: t.trendStep }, { label: lang === "zh" ? "算差額" : "Gap", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="minimum-wage-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["歷年", "加班", "申訴", "範本"] : ["History", "Overtime", "Complaint", "Template"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
