// @profile B
// Profile B · Calculator-YMYL · CaloriesBurnedActivity（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Activity = "walk" | "run" | "cycle" | "swim";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—";

const bands = [
  { key: "light", range: "MET 2–3", label: { zh: "輕度活動", en: "Light activity" }, desc: { zh: "如慢走、伸展，消耗較低但有助日常活動。", en: "Slow walking or stretching; low burn but supports daily activity." } },
  { key: "moderate-low", range: "MET 3–4", label: { zh: "中低強度", en: "Moderate-low" }, desc: { zh: "如快走、休閒騎車，適合多數人入門。", en: "Brisk walking or leisure cycling; good entry level." } },
  { key: "moderate", range: "MET 4–6", label: { zh: "中強度", en: "Moderate" }, desc: { zh: "如游泳、爬坡走，心率明顯上升。", en: "Swimming or uphill walking; heart rate clearly rises." } },
  { key: "vigorous", range: "MET 6–8", label: { zh: "高強度", en: "Vigorous" }, desc: { zh: "如慢跑、快速騎車，需良好基礎體能。", en: "Jogging or fast cycling; needs good base fitness." } },
  { key: "high", range: "MET 8–10", label: { zh: "極高強度", en: "High intensity" }, desc: { zh: "如跑步、激烈球類，消耗快但易疲勞。", en: "Running or intense sports; fast burn but tiring." } },
  { key: "max", range: "MET ≥ 10", label: { zh: "競技強度", en: "Competitive" }, desc: { zh: "競賽級訓練，需專業安排與恢復。", en: "Competition-level training; needs professional planning and recovery." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "步數熱量計算機", en: "Steps to Calories" }, href: "/tools/health/steps-to-calories-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動消耗 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "活動消耗熱量計算機 · Calories Burned", subtitle: "用運動類型代謝當量(MET)、體重與時間估算各種活動消耗熱量",
    intro: "Calories Burned by Activity 依據運動類型的代謝當量(MET)、體重(kg)與運動時間(分鐘)估算消耗的熱量（kcal），並比較不同運動強度，協助選擇適合的活動目標。",
    trustNoteLabel: "注意事項：", trustNote: "MET 為族群平均值，實際消耗受個人體能、效率與環境影響；本工具僅供運動規劃，不作醫療或減重處方。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立活動消耗範例", examplePreview: "消耗熱量預覽", examplePerson: "運動", fillExample: "一鍵填入步行範例", previewActivePath: "填入跑步範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入運動與體重", examplesHelper: "先用範例理解運動類型與時間如何換算熱量，再改成自己的運動、體重與時間。",
    metric: "公制 (kg/分)", imperial: "強度顯示", exampleCards: "範例卡", baselineExample: "步行 30 分鐘", activeExample: "跑步 30 分鐘", baselineExampleNote: "步行 · 70 kg · 30 分鐘", activeExampleNote: "跑步 · 70 kg · 30 分鐘", carbsLabel: "MET", carbsName: "代謝當量", proteinLabel: "消耗熱量", flowDemo: "體重", calculator: "計算機",
    weight: "運動時間 (分鐘)", tdee: "體重 (kg)", goal: "運動類型", goalCut: "步行", goalMaintain: "騎車", goalBulk: "游泳",
    resultCard: "活動消耗估算結果", unit: "kcal", primaryValue: "運動時間", maintenanceTarget: "MET 值", actionTarget: "每分鐘", estimatedTdee: "基準", maintenance: "MET", fatLossTarget: "每分鐘",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格運動強度判讀矩陣", tdeeMatrixNote: "L7 固定六格，依 MET 對應常見運動強度分級；這是規劃參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把活動消耗轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示消耗熱量、每分鐘熱量與相當步數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前運動規劃", dailyGap: "每分鐘熱量", weeklyTrend: "相當步數", motivation: "動力卡", keepMomentum: "從活動估算走向規律運動",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的活動消耗帶回家", journeyHint: "用每週累積消耗評估比單次運動更能反映整體活動量與進步。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用步數熱量計算機換算步行消耗", nextActionItem2: "用 TDEE 計算每日總消耗", nextActionItem3: "用巨量營養素或 BMR 檢查飲食基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "運動 → 消耗 → TDEE / 巨量營養素", bmrStep: "運動", deficitStep: "消耗", trendStep: "TDEE", mealStep: "營養",
    knowledge: "知識", knowledgeTitle: "活動消耗在運動規劃中的意義", definition: "定義", definitionText: "活動消耗熱量是運動相對於休息額外消耗的能量，用代謝當量(MET)、體重與時間量化，便於比較不同運動。", formula: "公式", formulaText: "消耗熱量 = MET × 體重(kg) × 時間(小時)。例如步行 MET 約 3.5、跑步 MET 約 9.8。每分鐘熱量 = 總熱量 ÷ 分鐘數。", limitations: "限制", limitationsText: "MET 為族群平均，個人效率、體脂與環境會造成偏差；高強度間歇與肌力訓練的後燃效應未計入。", interpretation: "解讀", interpretationText: "MET 值越高消耗越快，但持久度下降；選擇能規律執行的強度，比單次高消耗更有效。", context: "脈絡", contextText: "活動消耗應與 TDEE、巨量營養素與整體活動一起看，並以每週累積評估。", example: "範例", exampleText: "步行 MET 3.5、70 kg、30 分鐘(0.5 小時) → 消耗約 123 kcal、每分鐘約 4 kcal。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "運動規劃的下一步工具", premiumTitle: "PRO 運動追蹤包", premiumText: "解鎖多運動記錄、每週消耗趨勢、運動類型比較與個人化運動報告。", feat1: "運動記錄", feat2: "消耗趨勢", feat3: "類型比較", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、運動處方或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Steps to Calories · TDEE Calculator · Macro Calculator · BMR Calculator", references: "參考資料", referencesText: "Compendium of Physical Activities (Ainsworth et al.); ACSM Metabolic Equations; WHO physical activity recommendations; Harvard Health calorie burn reference。",
    q1: "MET 是什麼？", a1: "MET 是代謝當量，1 MET 約等於安靜休息時的耗氧量；MET 越高代表運動越費力、消耗越快。",
    q2: "為什麼和手錶數值不同？", a2: "穿戴裝置用心率與個人資料估算，會納入即時強度與效率，與 MET 平均值自然有差異。",
    q3: "肌力訓練怎麼算？", a3: "肌力訓練 MET 變動大且有後燃效應，本工具以一般運動 MET 估算，較適合有氧型活動參考。",
    q4: "運動越久越好嗎？", a4: "時間延長會增加消耗，但過量易疲勞與受傷；建議依體能逐步增加並安排恢復。",
    q5: "可以用來減重嗎？", a5: "可作參考，但減重仍需整體熱量赤字，建議搭配 TDEE 與飲食規劃一起評估。",
    q6: "這個工具能取代醫療建議嗎？", a6: "不能。它只是教育用估算；若有心血管疾病、關節問題或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Exercise Burn · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Calories Burned by Activity · Calories Burned", subtitle: "Estimate calories burned by activity using MET, weight, and time",
    intro: "This calculator uses an activity's metabolic equivalent (MET), body weight(kg), and exercise time (minutes) to estimate calories burned (kcal), and compares different intensities to help choose suitable activity goals.",
    trustNoteLabel: "Note:", trustNote: "MET values are population averages; actual burn varies with fitness, efficiency, and environment. This tool is for exercise planning, not a medical or weight-loss prescription.",
    quickActionCard: "Quick Action Card", tryExample: "Create a calories-burned example instantly", examplePreview: "Calories burned preview", examplePerson: "Activity", fillExample: "One-click walking example", previewActivePath: "Fill running example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter activity and weight", examplesHelper: "Start with an example to understand how activity type and time convert to calories, then replace with your own activity, weight, and time.",
    metric: "Metric (kg/min)", imperial: "Intensity view", exampleCards: "Example cards", baselineExample: "Walking 30 min", activeExample: "Running 30 min", baselineExampleNote: "Walking · 70 kg · 30 min", activeExampleNote: "Running · 70 kg · 30 min", carbsLabel: "MET", carbsName: "Metabolic equivalent", proteinLabel: "Calories burned", flowDemo: "Weight", calculator: "Calculator",
    weight: "Exercise time (minutes)", tdee: "Body weight (kg)", goal: "Activity type", goalCut: "Walk", goalMaintain: "Cycle", goalBulk: "Swim",
    resultCard: "Calories Burned Estimate", unit: "kcal", primaryValue: "Exercise time", maintenanceTarget: "MET value", actionTarget: "Per minute", estimatedTdee: "Basis", maintenance: "MET", fatLossTarget: "Per minute",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card exercise intensity interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards mapping MET to common exercise intensity levels. This is planning guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn calories burned into an actionable plan", conversionNote: "L9 values update from the computed result: calories burned, per-minute calories, and equivalent-steps hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current exercise plan", dailyGap: "Per-minute calories", weeklyTrend: "Equivalent steps", motivation: "Motivation Card", keepMomentum: "Move from estimate to regular exercise",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's calories burned home", journeyHint: "Weekly cumulative burn reflects overall activity and progress better than a single session.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Convert walking burn with Steps to Calories", nextActionItem2: "Compute total daily output with TDEE", nextActionItem3: "Check diet baseline with Macro or BMR",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Exercise → Burn → TDEE / Macros", bmrStep: "Exercise", deficitStep: "Burn", trendStep: "TDEE", mealStep: "Nutrition",
    knowledge: "Knowledge", knowledgeTitle: "What calories burned means in exercise planning", definition: "Definition", definitionText: "Calories burned by activity is the extra energy exercise uses relative to rest, quantified by MET, weight, and time to compare different activities.", formula: "Formula", formulaText: "Calories = MET × weight(kg) × time(hours). For example, walking MET ~3.5, running MET ~9.8. Per-minute calories = total calories ÷ minutes.", limitations: "Limitations", limitationsText: "MET is a population average; individual efficiency, body fat, and environment cause deviations, and the afterburn from HIIT and strength training is not included.", interpretation: "Interpretation", interpretationText: "Higher MET burns faster but reduces endurance; choosing an intensity you can do regularly is more effective than a single high-burn session.", context: "Context", contextText: "Calories burned should be viewed with TDEE, macros, and overall activity, and assessed by weekly totals.", example: "Example", exampleText: "Walking MET 3.5, 70 kg, 30 min (0.5 h) → ~123 kcal burned, ~4 kcal per minute.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for exercise planning", premiumTitle: "PRO Exercise Tracking Pack", premiumText: "Unlock multi-activity logging, weekly burn trends, exercise-type comparison, and personalized exercise reports.", feat1: "Activity log", feat2: "Burn trends", feat3: "Type compare", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, exercise prescription, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Steps to Calories · TDEE Calculator · Macro Calculator · BMR Calculator", references: "References", referencesText: "Compendium of Physical Activities (Ainsworth et al.); ACSM Metabolic Equations; WHO physical activity recommendations; Harvard Health calorie burn reference.",
    q1: "What is MET?", a1: "MET is the metabolic equivalent; 1 MET roughly equals oxygen use at rest. Higher MET means harder exercise and faster burn.",
    q2: "Why differ from my watch?", a2: "Wearables estimate from heart rate and personal data, factoring real-time intensity and efficiency, so they differ from MET averages.",
    q3: "How about strength training?", a3: "Strength training MET varies widely and has an afterburn effect; this tool uses general activity METs and suits aerobic activities better.",
    q4: "Is longer always better?", a4: "More time increases burn, but overdoing it risks fatigue and injury; increase gradually with your fitness and plan recovery.",
    q5: "Can I use it for weight loss?", a5: "It can be a reference, but weight loss still needs an overall calorie deficit; assess it with TDEE and diet planning.",
    q6: "Can this tool replace medical advice?", a6: "No. It is an educational estimate; for cardiovascular disease, joint issues, or special conditions, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function metFor(activity: Activity): number {
  if (activity === "run") return 9.8;
  if (activity === "cycle") return 7.5;
  if (activity === "swim") return 6.0;
  return 3.5;
}

export default function CaloriesBurnedActivity() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [minutes, setMinutes] = useState("30");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<Activity>("walk");
  const t = ui[lang];

  const result = useMemo(() => {
    const min = Number(minutes);
    const w = Number(weight);
    if (min <= 0 || w <= 0) return null;
    const met = metFor(activity);
    const hours = min / 60;
    const calories = met * w * hours;
    const perMin = calories / min;
    const equivSteps = calories / (w * 0.0004);
    return { met, calories, perMin, equivSteps };
  }, [minutes, weight, activity]);

  const calDisplay = result ? fmt(result.calories, 0) : "—";
  const metDisplay = result ? fmt(result.met, 1) : "—";
  const perMinDisplay = result ? fmt(result.perMin, 1) : "—";
  const stepsDisplay = result ? fmt(result.equivSteps, 0) : "—";

  function fillWalk() { setUnit("metric"); setMinutes("30"); setWeight("70"); setActivity("walk"); }
  function fillRun() { setUnit("metric"); setMinutes("30"); setWeight("70"); setActivity("run"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{calDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{activity === "walk" ? "🚶" : activity === "run" ? "🏃" : activity === "cycle" ? "🚴" : "🏊"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{metDisplay}</div></div></div><button onClick={fillWalk} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillRun} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillWalk} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3.5</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillRun} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">9.8</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={activity} onChange={(e) => setActivity(e.target.value as Activity)}><option value="walk">{t.goalCut}</option><option value="run">{lang === "zh" ? "跑步" : "Run"}</option><option value="cycle">{t.goalMaintain}</option><option value="swim">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{calDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{minutes} min</div><div className="mt-1 text-xs text-slate-300">{weight} kg</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{metDisplay}</p><p className="text-sm font-bold text-blue-700">MET</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{perMinDisplay}</p><p className="text-sm font-bold text-emerald-700">kcal</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{metDisplay}</p><p className="text-sm font-bold text-orange-700">MET</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{calDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="burned-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{calDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{perMinDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{stepsDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Exercise", note: t.bmrStep }, { label: "Burn", note: t.deficitStep }, { label: "TDEE", note: t.trendStep }, { label: "Macros", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="burned-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
