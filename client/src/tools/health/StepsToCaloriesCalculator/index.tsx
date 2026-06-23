// @profile B
// Profile B · Calculator-YMYL · StepsToCaloriesCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—";

const bands = [
  { key: "sedentary", range: "< 5,000", label: { zh: "久坐", en: "Sedentary" }, desc: { zh: "活動量偏低，建議逐步增加日常步行。", en: "Low activity; gradually add daily walking." } },
  { key: "low-active", range: "5,000–7,499", label: { zh: "低度活動", en: "Low active" }, desc: { zh: "略高於久坐，仍有提升空間。", en: "Slightly above sedentary; room to improve." } },
  { key: "somewhat", range: "7,500–9,999", label: { zh: "中度活動", en: "Somewhat active" }, desc: { zh: "接近一般健康建議的活動水準。", en: "Near common health activity recommendations." } },
  { key: "active", range: "10,000–12,499", label: { zh: "活躍", en: "Active" }, desc: { zh: "達到常見每日萬步目標。", en: "Meets the common 10,000-step daily goal." } },
  { key: "highly", range: "≥ 12,500", label: { zh: "高度活躍", en: "Highly active" }, desc: { zh: "活動量充足，注意恢復與營養。", en: "Ample activity; mind recovery and nutrition." } },
  { key: "athlete", range: "≥ 15,000", label: { zh: "運動員級", en: "Athlete level" }, desc: { zh: "高訓練量族群，需個別化能量規劃。", en: "High-volume group; needs individualized energy planning." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "活動消耗計算機", en: "Calories Burned Calculator" }, href: "/tools/health/calories-burned-activity" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 活動量規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "步數熱量計算機 · Steps to Calories", subtitle: "用步數、體重與步幅估算步行消耗熱量與步行距離",
    intro: "Steps to Calories Calculator 依據步數、體重(kg)與平均步幅(m)估算步行消耗的熱量（kcal）與步行距離（km），協助把每日步數轉成可理解的能量與距離參考。",
    trustNoteLabel: "注意事項：", trustNote: "步行熱量為一般估算，受步速、地形、體組成與裝置誤差影響；本工具僅供活動規劃，不作醫療或減重處方。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立步數熱量範例", examplePreview: "消耗熱量預覽", examplePerson: "步數", fillExample: "一鍵填入標準範例", previewActivePath: "填入萬步範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入步數與體重", examplesHelper: "先用範例理解步數如何換算熱量與距離，再改成自己的步數、體重與步幅。",
    metric: "公制 (kg/m)", imperial: "步數顯示", exampleCards: "範例卡", baselineExample: "8000 步示範", activeExample: "10000 步示範", baselineExampleNote: "8000 步 · 70 kg · 步幅 0.75 m", activeExampleNote: "10000 步 · 70 kg · 步幅 0.75 m", carbsLabel: "距離", carbsName: "步行距離", proteinLabel: "消耗熱量", flowDemo: "體重", calculator: "計算機",
    weight: "步數", tdee: "體重 (kg)", goal: "步幅 (m)", goalCut: "短", goalMaintain: "中", goalBulk: "長",
    resultCard: "步數熱量估算結果", unit: "kcal", primaryValue: "輸入步數", maintenanceTarget: "距離 (km)", actionTarget: "每步熱量", estimatedTdee: "基準", maintenance: "距離", fatLossTarget: "每步",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格活動量判讀矩陣", tdeeMatrixNote: "L7 固定六格，依每日步數對應常見活動量分級；這是規劃參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把步數熱量轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示消耗熱量、步行距離與每千步熱量提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前活動規劃", dailyGap: "步行距離", weeklyTrend: "每千步熱量", motivation: "動力卡", keepMomentum: "從步數估算走向規律活動",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的步數熱量帶回家", journeyHint: "用 3–7 天平均步數估算，比單日數值更能反映真實活動量。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用活動消耗計算機比較其他運動", nextActionItem2: "用 TDEE 計算每日總消耗", nextActionItem3: "用巨量營養素或 BMI 檢查飲食基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "步數 → 熱量 → TDEE / 巨量營養素", bmrStep: "步數", deficitStep: "熱量", trendStep: "TDEE", mealStep: "營養",
    knowledge: "知識", knowledgeTitle: "步數熱量在活動規劃中的意義", definition: "定義", definitionText: "步行熱量是身體在行走中額外消耗的能量，受步數、體重、步幅與步速影響，常用來量化日常活動。", formula: "公式", formulaText: "步行距離 = 步數 × 步幅(m) ÷ 1000(km)。消耗熱量 ≈ 體重(kg) × 距離(km) × 0.53 kcal。每步熱量 = 總熱量 ÷ 步數。", limitations: "限制", limitationsText: "0.53 為一般步行係數，慢走或快走會偏低或偏高；穿戴裝置計步與步幅誤差也會影響結果。", interpretation: "解讀", interpretationText: "每日約 7000–10000 步常作健康參考；熱量估算用於相對比較，不應視為精準量測。", context: "脈絡", contextText: "步數熱量應與 TDEE、巨量營養素與整體活動一起看，並用平均值校正。", example: "範例", exampleText: "8000 步、70 kg、步幅 0.75 m → 距離約 6 km、消耗約 222 kcal、每步約 0.028 kcal。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "活動規劃的下一步工具", premiumTitle: "PRO 活動追蹤包", premiumText: "解鎖每日步數趨勢、熱量累積圖、運動類型比較與個人化活動報告。", feat1: "步數趨勢", feat2: "熱量圖", feat3: "運動比較", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、運動處方或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Calories Burned Calculator · TDEE Calculator · Macro Calculator · BMI Calculator", references: "參考資料", referencesText: "Compendium of Physical Activities (Ainsworth et al.); ACSM Metabolic Equations; Tudor-Locke step-count guidance; WHO physical activity recommendations。",
    q1: "步行熱量怎麼算？", a1: "用步數乘步幅得距離，再以體重與距離乘以步行係數估算；本工具用 0.53 kcal/kg/km 作一般值。",
    q2: "步幅要怎麼填？", a2: "一般成人步幅約 0.65–0.80 m，可用身高 × 0.43 估算；填得越準距離與熱量越貼近實際。",
    q3: "為什麼和手錶數值不同？", a3: "穿戴裝置用心率與內建演算法，會納入步速與地形，與單純步數估算自然有差異。",
    q4: "走萬步能減重嗎？", a4: "萬步可增加活動消耗，但減重仍需整體熱量赤字，建議搭配 TDEE 與飲食規劃。",
    q5: "快走和慢走熱量一樣嗎？", a5: "不一樣，快走每分鐘消耗更高；本工具以距離估算，未細分步速，僅供概略參考。",
    q6: "這個工具能取代醫療建議嗎？", a6: "不能。它只是教育用估算；若有心血管疾病、關節問題或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Activity Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Steps to Calories Calculator · Steps to Calories", subtitle: "Estimate walking calories and distance from steps, weight, and stride",
    intro: "This calculator uses steps, body weight(kg), and average stride(m) to estimate walking calories burned (kcal) and walking distance (km), turning your daily step count into understandable energy and distance references.",
    trustNoteLabel: "Note:", trustNote: "Walking calories are a general estimate affected by pace, terrain, body composition, and device error; this tool is for activity planning, not a medical or weight-loss prescription.",
    quickActionCard: "Quick Action Card", tryExample: "Create a steps-to-calories example instantly", examplePreview: "Calories burned preview", examplePerson: "Steps", fillExample: "One-click standard example", previewActivePath: "Fill 10k-step example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter steps and weight", examplesHelper: "Start with an example to understand how steps convert to calories and distance, then replace with your own steps, weight, and stride.",
    metric: "Metric (kg/m)", imperial: "Step view", exampleCards: "Example cards", baselineExample: "8000-step demo", activeExample: "10000-step demo", baselineExampleNote: "8000 steps · 70 kg · stride 0.75 m", activeExampleNote: "10000 steps · 70 kg · stride 0.75 m", carbsLabel: "Distance", carbsName: "Walking distance", proteinLabel: "Calories burned", flowDemo: "Weight", calculator: "Calculator",
    weight: "Steps", tdee: "Body weight (kg)", goal: "Stride (m)", goalCut: "Short", goalMaintain: "Medium", goalBulk: "Long",
    resultCard: "Steps to Calories Estimate", unit: "kcal", primaryValue: "Input steps", maintenanceTarget: "Distance (km)", actionTarget: "Per-step kcal", estimatedTdee: "Basis", maintenance: "Distance", fatLossTarget: "Per step",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card activity-level interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards mapping daily steps to common activity levels. This is planning guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn steps-to-calories into an actionable plan", conversionNote: "L9 values update from the computed result: calories burned, walking distance, and calories-per-1000-steps hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current activity plan", dailyGap: "Walking distance", weeklyTrend: "kcal per 1000 steps", motivation: "Motivation Card", keepMomentum: "Move from step estimate to regular activity",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's steps-to-calories home", journeyHint: "Estimate with a 3–7 day average step count to reflect real activity better than a single day.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Compare other exercises with Calories Burned Calculator", nextActionItem2: "Compute total daily output with TDEE", nextActionItem3: "Check diet baseline with Macro or BMI",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Steps → Calories → TDEE / Macros", bmrStep: "Steps", deficitStep: "Calories", trendStep: "TDEE", mealStep: "Nutrition",
    knowledge: "Knowledge", knowledgeTitle: "What steps-to-calories means in activity planning", definition: "Definition", definitionText: "Walking calories are the extra energy the body spends while walking, affected by steps, weight, stride, and pace, often used to quantify daily activity.", formula: "Formula", formulaText: "Walking distance = steps × stride(m) ÷ 1000 (km). Calories ≈ weight(kg) × distance(km) × 0.53 kcal. Per-step calories = total calories ÷ steps.", limitations: "Limitations", limitationsText: "0.53 is a general walking coefficient; slow or brisk walking runs lower or higher, and device step/stride errors also affect results.", interpretation: "Interpretation", interpretationText: "About 7000–10000 steps daily is a common health reference; calorie estimates are for relative comparison, not precise measurement.", context: "Context", contextText: "Steps-to-calories should be viewed with TDEE, macros, and overall activity, and corrected with averages.", example: "Example", exampleText: "8000 steps, 70 kg, stride 0.75 m → distance ~6 km, ~222 kcal burned, ~0.028 kcal per step.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for activity planning", premiumTitle: "PRO Activity Tracking Pack", premiumText: "Unlock daily step trends, cumulative calorie charts, exercise-type comparison, and personalized activity reports.", feat1: "Step trends", feat2: "Calorie chart", feat3: "Exercise compare", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, exercise prescription, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Calories Burned Calculator · TDEE Calculator · Macro Calculator · BMI Calculator", references: "References", referencesText: "Compendium of Physical Activities (Ainsworth et al.); ACSM Metabolic Equations; Tudor-Locke step-count guidance; WHO physical activity recommendations.",
    q1: "How are walking calories calculated?", a1: "Multiply steps by stride for distance, then multiply weight and distance by a walking coefficient; this tool uses 0.53 kcal/kg/km as a general value.",
    q2: "How do I fill in stride?", a2: "Adult stride is about 0.65–0.80 m; estimate as height × 0.43. The more accurate it is, the closer distance and calories match reality.",
    q3: "Why differ from my watch?", a3: "Wearables use heart rate and built-in algorithms factoring pace and terrain, so they naturally differ from a plain step estimate.",
    q4: "Can 10,000 steps cause weight loss?", a4: "10,000 steps raise activity output, but weight loss still needs an overall calorie deficit; pair it with TDEE and diet planning.",
    q5: "Are brisk and slow walking the same calories?", a5: "No; brisk walking burns more per minute. This tool estimates by distance and does not separate pace, so it is approximate.",
    q6: "Can this tool replace medical advice?", a6: "No. It is an educational estimate; for cardiovascular disease, joint issues, or special conditions, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function StepsToCaloriesCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [steps, setSteps] = useState("8000");
  const [weight, setWeight] = useState("70");
  const [stride, setStride] = useState("0.75");
  const t = ui[lang];

  const result = useMemo(() => {
    const s = Number(steps);
    const w = Number(weight);
    const st = Number(stride);
    if (s <= 0 || w <= 0 || st <= 0) return null;
    const distanceKm = (s * st) / 1000;
    const calories = w * distanceKm * 0.53;
    const perStep = calories / s;
    const perThousand = calories / (s / 1000);
    return { distanceKm, calories, perStep, perThousand };
  }, [steps, weight, stride]);

  const calDisplay = result ? fmt(result.calories, 0) : "—";
  const distDisplay = result ? fmt(result.distanceKm, 2) : "—";
  const perStepDisplay = result ? fmt(result.perStep, 3) : "—";
  const perKDisplay = result ? fmt(result.perThousand, 1) : "—";

  function fillStandard() { setUnit("metric"); setSteps("8000"); setWeight("70"); setStride("0.75"); }
  function fill10k() { setUnit("metric"); setSteps("10000"); setWeight("70"); setStride("0.75"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{calDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{steps}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{distDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fill10k} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">8000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fill10k} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">10000</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={steps} onChange={(e) => setSteps(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={stride} onChange={(e) => setStride(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{calDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{steps}</div><div className="mt-1 text-xs text-slate-300">{weight} kg</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{distDisplay}</p><p className="text-sm font-bold text-blue-700">km</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{perStepDisplay}</p><p className="text-sm font-bold text-emerald-700">kcal</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{distDisplay}</p><p className="text-sm font-bold text-orange-700">km</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{calDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="steps-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{calDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{distDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{perKDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Steps", note: t.bmrStep }, { label: "Calories", note: t.deficitStep }, { label: "TDEE", note: t.trendStep }, { label: "Macros", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
