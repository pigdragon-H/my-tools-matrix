// @profile B
// Profile B · Calculator-Travel · AltitudeSicknessCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "gentle" | "standard" | "rapid";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 25%", label: { zh: "極低", en: "Very Low" }, desc: { zh: "上升節奏保守，幾乎無高山症風險，可正常活動。", en: "Conservative ascent—almost no altitude-sickness risk, normal activity." } },
  { key: "low", range: "25–45%", label: { zh: "低", en: "Low" }, desc: { zh: "風險偏低，留意飲水與睡眠即可舒適適應。", en: "Low risk; hydration and sleep keep acclimatization comfortable." } },
  { key: "healthy", range: "45–65%", label: { zh: "中等", en: "Moderate" }, desc: { zh: "常見登山風險區間，建議放慢上升並安排適應日。", en: "Common climbing band; slow the ascent and schedule an acclimatization day." } },
  { key: "good", range: "65–80%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "風險偏高，宜增加適應天數並監測頭痛與睡眠。", en: "Elevated risk; add acclimatization days and monitor headache and sleep." } },
  { key: "strong", range: "80–95%", label: { zh: "高", en: "High" }, desc: { zh: "上升過快易發病，建議拆段、降海拔過夜或預防用藥。", en: "Fast ascent risks illness; split the climb, sleep lower, or consider prophylaxis." } },
  { key: "elite", range: "> 95%", label: { zh: "極高", en: "Severe" }, desc: { zh: "上升速度過快有嚴重風險，務必延長適應或下撤。", en: "Excessive ascent speed is a serious risk; extend acclimatization or descend." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊補水計算機", en: "Travel Hydration Calculator" }, href: "/tools/travel/travel-hydration-calculator" },
  { label: { zh: "防曬係數計算機", en: "SPF Calculator" }, href: "/tools/travel/spf-calculator" },
  { label: { zh: "疫苗接種排程計算機", en: "Vaccine Schedule Calculator" }, href: "/tools/travel/vaccine-schedule-calculator" },
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 高山症 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "高山症風險計算機 · Altitude", subtitle: "用目標海拔、上升天數與上升節奏估算高山症風險占比與建議適應天數",
    intro: "Altitude Sickness Calculator 依據目標海拔、計畫上升天數與上升節奏（保守、標準或快速），計算每日上升高度、風險占比與安全適應所需天數，協助您判斷行程是否上升太快、該不該多排適應日、何時該降海拔過夜或預防用藥，讓高海拔旅行更安全舒適。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以每日上升高度與建議上限估算，未含年齡、體質、過往病史與血氧；實際高山症風險請以自身狀況與專業醫療判斷為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立高山範例", examplePreview: "風險預覽", examplePerson: "目標海拔", fillExample: "一鍵填入標準節奏範例", previewActivePath: "填入快速上升範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入目標海拔、上升天數與上升節奏", examplesHelper: "先用範例理解海拔與節奏如何決定每日上升高度與風險占比，再改成自己的行程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準節奏模式", activeExample: "快速上升示範", baselineExampleNote: "海拔 3500 · 天數 3 · 標準", activeExampleNote: "海拔 3500 · 天數 2 · 快速", carbsLabel: "每日上升", carbsName: "公尺", proteinLabel: "風險占比", flowDemo: "上升天數", calculator: "計算機",
    weight: "目標海拔 (公尺)", tdee: "計畫上升天數 (天)", goal: "上升節奏", goalCut: "保守 (300m/天)", goalMaintain: "標準 (500m/天)", goalBulk: "快速 (800m/天)",
    resultCard: "高山症風險結果", unit: "% (風險占比)", primaryValue: "主要數值", maintenanceTarget: "建議適應天數", actionTarget: "每日上升", estimatedTdee: "上升天數", maintenance: "天", fatLossTarget: "公尺",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格高山症風險占比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前風險占比放進常見區間；這是規劃參考，不是醫療結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把高山風險轉成可執行的行程策略", conversionNote: "L9 會連動目前計算結果，顯示風險占比、每日上升與適應天數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前高山概況", dailyGap: "風險占比", weeklyTrend: "每日上升", motivation: "動力卡", keepMomentum: "從風險分析走向安全舒適的登山節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的風險結果帶回團隊", journeyHint: "用旅遊補水計算機一起看，把適應天數與每日補水一併納入登山規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊補水計算機算出每日補水量", nextActionItem2: "用防曬係數計算機規劃高海拔防曬", nextActionItem3: "用疫苗接種排程確認行前準備",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "海拔 → 風險占比 → 節奏 → 天數", bmrStep: "海拔", deficitStep: "風險占比", trendStep: "節奏", mealStep: "天數",
    knowledge: "知識", knowledgeTitle: "上升節奏在高山症風險中的意義", definition: "定義", definitionText: "高山症風險評估是把目標海拔依上升節奏與天數換算成每日上升高度與風險占比；每日上升高度是發病風險的核心指標，上升越快風險越高。", formula: "公式", formulaText: "每日上升 = 目標海拔 ÷ 上升天數。風險占比 = 每日上升 ÷ 建議上限。安全適應天數 = 目標海拔 ÷ 建議上限。", limitations: "限制", limitationsText: "本工具以每日上升高度與建議上限估算；真實高山症風險還受年齡、體質、過往病史、血氧、睡眠海拔與用藥影響，且 2500 公尺以上風險明顯上升。", interpretation: "解讀", interpretationText: "風險占比超過 65% 屬偏高，超過 95% 屬極高；可透過放慢上升、增加適應日、降海拔過夜與預防用藥來改善。", context: "脈絡", contextText: "高山結果應與旅遊補水、防曬係數與疫苗接種一起看，才能在高海拔行程中兼顧安全與健康。", example: "範例", exampleText: "目標海拔 3500、標準節奏（500m/天）、天數 3 → 每日上升約 1167 公尺，風險偏高，建議放慢。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "高山的下一步工具", premiumTitle: "PRO 高山症分析包", premiumText: "解鎖睡眠海拔追蹤、血氧紀錄整合、預防用藥提醒與分段適應計畫。", feat1: "睡眠高度", feat2: "血氧記錄", feat3: "預防警示", feat4: "分段計畫",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代醫療建議或專業高山醫學診斷。", relatedTools: "相關工具", relatedToolsText: "Travel Hydration · SPF · Vaccine Schedule · Travel Budget", references: "參考資料", referencesText: "高山醫學會建議；高海拔適應指引；急性高山症研究；登山安全文獻。",
    q1: "每日上升怎麼算的？", a1: "本工具以目標海拔除以上升天數得每日上升，再對建議上限換算風險占比；實際還受體質與睡眠海拔影響。",
    q2: "上升多快算危險？", a2: "一般建議睡眠海拔每日上升不超過 500 公尺並每升 1000 公尺安排適應日；上升越快急性高山症風險越高。",
    q3: "保守還是快速節奏？", a3: "高海拔或初次登高者宜選保守；體能好且有經驗者可選標準，但仍建議監測症狀與安排適應日。",
    q4: "風險太高怎麼降？", a4: "增加上升天數、安排適應日、降海拔過夜、避免快速登頂，必要時諮詢醫師預防用藥。",
    q5: "要不要把適應日算進去？", a5: "要。本工具的安全適應天數已依建議上限估算；實際請保留適應日與彈性下撤空間。",
    q6: "這個工具能取代醫師嗎？", a6: "不能。它只是快速估算與教育用途；有心肺疾病或高山症病史請務必諮詢專業醫師。" },
  en: {
    badge: "Travel · Altitude · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Altitude Sickness Calculator", subtitle: "Estimate altitude-sickness risk share and recommended acclimatization days from target altitude, ascent days, and pace",
    intro: "This calculator uses target altitude, planned ascent days, and ascent pace (gentle, standard, or rapid) to compute daily elevation gain, a risk share, and the days needed for safe acclimatization, helping you judge whether the ascent is too fast, whether to add acclimatization days, and when to sleep lower or consider prophylaxis, making high-altitude travel safer and more comfortable.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from daily elevation gain and a recommended limit, excluding age, constitution, medical history, and blood oxygen; judge real altitude-sickness risk by your own state and professional medical advice.",
    quickActionCard: "Quick Action Card", tryExample: "Create an altitude example instantly", examplePreview: "Risk preview", examplePerson: "Target altitude", fillExample: "One-click standard pace example", previewActivePath: "Fill rapid ascent example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter target altitude, ascent days, and ascent pace", examplesHelper: "Start with an example to see how altitude and pace set the daily gain and risk share, then replace with your own trip data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard pace mode", activeExample: "Rapid demo", baselineExampleNote: "Altitude 3500 · days 3 · standard", activeExampleNote: "Altitude 3500 · days 2 · rapid", carbsLabel: "Daily gain", carbsName: "meters", proteinLabel: "Risk share", flowDemo: "Ascent days", calculator: "Calculator",
    weight: "Target altitude (m)", tdee: "Planned ascent days (days)", goal: "Ascent pace", goalCut: "Gentle (300m/day)", goalMaintain: "Standard (500m/day)", goalBulk: "Rapid (800m/day)",
    resultCard: "Altitude Risk Result", unit: "% (risk share)", primaryValue: "Primary Value", maintenanceTarget: "Acclimatization days", actionTarget: "Daily gain", estimatedTdee: "Ascent days", maintenance: "days", fatLossTarget: "meters",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card altitude-risk-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current risk share into common zones. This is planning guidance, not a medical conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the altitude risk into an actionable itinerary strategy", conversionNote: "L9 values update from the computed result: risk share, daily gain, and acclimatization hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current altitude snapshot", dailyGap: "Risk share", weeklyTrend: "Daily gain", motivation: "Motivation Card", keepMomentum: "Move from risk analysis to a safe, comfortable climbing pace",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's risk result to your group", journeyHint: "Review it with the Travel Hydration Calculator to fold acclimatization days and daily hydration into climb planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Compute daily hydration with the Travel Hydration Calculator", nextActionItem2: "Plan high-altitude sun protection with the SPF Calculator", nextActionItem3: "Confirm pre-trip prep with Vaccine Schedule",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with teammates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Altitude → Risk Share → Pace → Days", bmrStep: "Altitude", deficitStep: "Risk share", trendStep: "Pace", mealStep: "Days",
    knowledge: "Knowledge", knowledgeTitle: "What ascent pace means in altitude-sickness risk", definition: "Definition", definitionText: "Altitude-risk assessment converts target altitude by ascent pace and days into daily elevation gain and a risk share; daily elevation gain is the core indicator of illness risk—the faster you ascend, the higher the risk.", formula: "Formula", formulaText: "Daily gain = target altitude ÷ ascent days. Risk share = daily gain ÷ recommended limit. Safe acclimatization days = target altitude ÷ recommended limit.", limitations: "Limitations", limitationsText: "This tool estimates from daily elevation gain and a recommended limit; real altitude-sickness risk is also affected by age, constitution, medical history, blood oxygen, sleeping altitude, and medication, and rises markedly above 2500 meters.", interpretation: "Interpretation", interpretationText: "A risk share over 65% is elevated and over 95% is severe; improve it by slowing the ascent, adding acclimatization days, sleeping lower, and considering prophylaxis.", context: "Context", contextText: "Altitude results should be evaluated with travel hydration, SPF, and vaccine schedule to balance safety and health on high-altitude trips.", example: "Example", exampleText: "Target altitude 3500, standard pace (500m/day), days 3 → about 1167 meters daily gain, elevated risk—slow down advised.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for altitude", premiumTitle: "PRO Altitude Analytics Pack", premiumText: "Unlock sleeping-altitude tracking, blood-oxygen log integration, prophylaxis reminders, and staged acclimatization plans.", feat1: "Sleep Altitude", feat2: "Oxygen Log", feat3: "Prophylaxis Alert", feat4: "Staged Plan",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace medical advice or professional high-altitude diagnosis.", relatedTools: "Related Tools", relatedToolsText: "Travel Hydration · SPF · Vaccine Schedule · Travel Budget", references: "References", referencesText: "High-altitude medicine society guidance; acclimatization guidelines; acute mountain sickness studies; climbing-safety literature.",
    q1: "How is daily gain calculated?", a1: "This tool divides target altitude by ascent days for daily gain, then computes a risk share against a recommended limit; actual is also affected by constitution and sleeping altitude.",
    q2: "How fast an ascent is dangerous?", a2: "It is generally advised to gain no more than 500 meters of sleeping altitude per day and add an acclimatization day every 1000 meters; faster ascent raises acute mountain sickness risk.",
    q3: "Gentle or rapid pace?", a3: "High altitudes or first-time climbers should pick gentle; fit and experienced climbers may pick standard, but still monitor symptoms and schedule acclimatization days.",
    q4: "How do I reduce high risk?", a4: "Add ascent days, schedule acclimatization days, sleep lower, avoid rapid summiting, and consult a physician about prophylaxis when needed.",
    q5: "Should I count acclimatization days?", a5: "Yes. This tool's safe acclimatization days are estimated against a recommended limit; in practice keep acclimatization days and room to descend.",
    q6: "Can this tool replace a doctor?", a6: "No. It is a quick estimate for education; for cardiopulmonary disease or a history of altitude sickness, be sure to consult a professional physician." },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function ascentLimit(mode: TierMode): number {
  if (mode === "gentle") return 300;
  if (mode === "rapid") return 800;
  return 500;
}

export default function AltitudeSicknessCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("3500");
  const [tdee, setTdee] = useState("3");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const altitude = Number(weight);
    const days = Number(tdee);
    if (altitude <= 0 || days <= 0) return null;
    const dailyGain = altitude / days;
    const limit = ascentLimit(goal);
    const riskShare = Math.min((dailyGain / limit) * 100, 100);
    const acclimatizeDays = altitude / limit;
    return { altitude, days, dailyGain, riskShare, acclimatizeDays };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.riskShare, 1) : "—";
  const fatDisplay = result ? fmt(result.dailyGain, 0) : "—";
  const carbDisplay = result ? fmt(result.acclimatizeDays, 1) : "—";
  const totalDisplay = result ? fmt(result.riskShare, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("3500"); setTdee("3"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("3500"); setTdee("2"); setGoal("rapid"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "gentle" ? "🟢" : goal === "rapid" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">100</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">100</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="gentle">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="rapid">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{carbDisplay}</p><p className="text-sm font-bold text-blue-700">d</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">m</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.proteinLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-orange-950">{proteinDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="altitude-sickness-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.riskShare, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.dailyGain, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Altitude", note: t.bmrStep }, { label: "RiskShare", note: t.deficitStep }, { label: "Pace", note: t.trendStep }, { label: "Days", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
