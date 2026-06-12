// @profile B
// Profile B · Calculator-YMYL · SwimmingCaloriesCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type StrokeMode = "freestyle" | "breaststroke" | "backstroke" | "butterfly" | "leisure";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

// MET reference values for swimming strokes (moderate-vigorous effort)
function metFor(mode: StrokeMode): number {
  if (mode === "butterfly") return 13.8;
  if (mode === "breaststroke") return 10.3;
  if (mode === "backstroke") return 9.5;
  if (mode === "freestyle") return 8.3;
  return 6.0; // leisure
}

const bands = [
  { key: "very-light", range: "< 150 kcal", label: { zh: "極輕量消耗", en: "Very light burn" }, desc: { zh: "短時或悠閒游，適合暖身與恢復。", en: "Short or leisure swim; good for warm-up and recovery." } },
  { key: "light", range: "150–300 kcal", label: { zh: "輕量消耗", en: "Light burn" }, desc: { zh: "基礎水中活動量，建立習慣。", en: "Baseline water activity; builds habit." } },
  { key: "moderate", range: "300–500 kcal", label: { zh: "中度消耗", en: "Moderate burn" }, desc: { zh: "常見訓練量，兼顧效率與關節友善。", en: "Common training range; efficient and joint-friendly." } },
  { key: "high", range: "500–700 kcal", label: { zh: "高度消耗", en: "High burn" }, desc: { zh: "較長或高強度泳訓，注意補水。", en: "Longer or high-intensity swim; mind hydration." } },
  { key: "very-high", range: "700–900 kcal", label: { zh: "極高消耗", en: "Very high burn" }, desc: { zh: "大量消耗，安排足夠休息。", en: "Large burn; schedule enough rest." } },
  { key: "extreme", range: "> 900 kcal", label: { zh: "極限消耗", en: "Extreme burn" }, desc: { zh: "單次消耗很高，建議分段進行。", en: "Very high single session; consider splitting." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "運動消耗計算機", en: "Exercise Calories Calculator" }, href: "/tools/health/exercise-calories-calculator" },
  { label: { zh: "卡路里燃燒計算機", en: "Calorie Burn Calculator" }, href: "/tools/health/calorie-burn-calculator" },
  { label: { zh: "最大心率計算機", en: "Max Heart Rate Calculator" }, href: "/tools/health/max-heart-rate-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "游泳消耗計算機 · Swimming Calories", subtitle: "用泳姿、時間與體重估算游泳消耗的卡路里",
    intro: "Swimming Calories Calculator 依據泳姿（自由式/蛙式/仰式/蝶式/悠閒游）的 MET 值、游泳時間(分鐘)與體重(kg)，估算單次游泳消耗的卡路里，並換算每週訓練量與脂肪當量參考。",
    trustNoteLabel: "注意事項：", trustNote: "MET 值為一般族群平均，實際消耗受技術效率、水溫與休息時間影響；數值僅供規劃參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立游泳消耗範例", examplePreview: "單次消耗預覽", examplePerson: "體重", fillExample: "一鍵填入標準範例", previewActivePath: "填入蝶式範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入泳姿、時間與體重", examplesHelper: "先用範例理解游泳消耗的計算邏輯，再改成自己的體重與游泳時間。",
    metric: "公制 (kg/min)", imperial: "英制 (lb/min)", exampleCards: "範例卡", baselineExample: "自由式 30 分鐘", activeExample: "蝶式示範", baselineExampleNote: "70 kg · 30 分鐘 · ≈ 305 kcal", activeExampleNote: "70 kg · 20 分鐘 · ≈ 338 kcal", flowDemo: "70 kg", calculator: "計算機",
    weight: "體重 (kg)", minutes: "游泳時間 (分鐘)", mode: "泳姿", modeFree: "自由式", modeBreast: "蛙式", modeBack: "仰式", modeFly: "蝶式", modeLeisure: "悠閒游",
    resultCard: "單次游泳消耗結果", unit: "kcal/次", primaryValue: "本次游泳", maintenanceTarget: "每分鐘消耗", actionTarget: "每週消耗", estimatedTdee: "MET 值", maintenance: "每分鐘", fatLossTarget: "每週 (3 次)", fatLabel: "脂肪",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格游泳消耗判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前單次消耗放進常見泳訓強度區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把游泳消耗轉成可執行訓練計畫", conversionNote: "L9 會連動目前計算結果，顯示每週訓練量、脂肪當量與恢復提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前游泳規劃", dailyGap: "每分鐘", weeklyTrend: "脂肪當量(g)", motivation: "動力卡", keepMomentum: "從單次消耗走向穩定每週訓練量",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的游泳消耗帶回家", journeyHint: "用每週累積訓練量評估進度；游泳對關節友善，適合長期維持的有氧運動。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Exercise Calories 比較陸上運動消耗", nextActionItem2: "用 Max Heart Rate 對應游泳強度心率", nextActionItem3: "用 TDEE 安排訓練後的熱量平衡",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "游泳消耗 → 每週訓練量 → TDEE → 營養", bmrStep: "游泳消耗", deficitStep: "每週訓練量", trendStep: "TDEE", mealStep: "營養補充",
    knowledge: "知識", knowledgeTitle: "游泳消耗在健康宇宙中的意義", definition: "定義", definitionText: "游泳消耗是身體在水中運動時超過靜止代謝的額外能量，因水的阻力與散熱，常比同強度陸上運動消耗更多。", formula: "公式", formulaText: "消耗(kcal) = MET × 3.5 × 體重(kg) ÷ 200 × 時間(分鐘)。自由式 MET≈8.3、蛙式 10.3、仰式 9.5、蝶式 13.8、悠閒游 6.0。脂肪當量(g) = 消耗 ÷ 7700 × 1000。", limitations: "限制", limitationsText: "MET 為族群平均；技術好的泳者效率高、消耗略低，初學者因動作費力反而較高。水溫低時散熱也會增加消耗。", interpretation: "解讀", interpretationText: "蝶式與蛙式消耗較高但較難長時間維持；自由式適合穩定耐力訓練。真正影響體重的是長期累積與飲食。", context: "脈絡", contextText: "游泳消耗應與 TDEE、營養一起看，先估算每週訓練量再規劃飲食。", example: "範例", exampleText: "體重 70 kg、自由式 30 分鐘、MET 8.3 → 8.3 × 3.5 × 70 ÷ 200 × 30 ≈ 305 kcal。" ,
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "游泳訓練的下一步工具", premiumTitle: "PRO 游泳訓練包", premiumText: "解鎖每週訓練量趨勢、泳姿效率分析、間歇課表生成與恢復評分報告。", feat1: "訓練量", feat2: "效率", feat3: "間歇", feat4: "恢復",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、運動處方或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Exercise Calories Calculator · Calorie Burn Calculator · Max Heart Rate Calculator · TDEE Calculator", references: "參考資料", referencesText: "Compendium of Physical Activities (Ainsworth et al.); ACSM Guidelines for Exercise Testing and Prescription; WHO Physical Activity Guidelines。",
    q1: "游泳消耗真的比跑步高嗎？", a1: "視強度而定。蝶式、快速自由式 MET 可超過跑步；但悠閒游較低。水的阻力與散熱讓相同心率下消耗常略高。",
    q2: "為什麼蝶式消耗最高？", a2: "蝶式動作幅度大、全身協同發力且效率較低，MET 值在泳姿中最高，但多數人只能短時間維持。",
    q3: "游泳能減脂嗎？", a3: "可以。游泳搭配飲食控制能擴大熱量赤字，且對關節友善，適合體重較重者長期進行。",
    q4: "怎麼提升游泳消耗？", a4: "增加距離、提高泳速或加入間歇；技術進步雖讓單位消耗下降，但能游更久反而總消耗更高。",
    q5: "水溫會影響嗎？", a5: "會。低水溫時身體需額外產熱維持體溫，會略增消耗，但不建議刻意在過冷水中長泳。",
    q6: "這個工具能診斷體能或疾病嗎？", a6: "不能。它只是教育用估算；若有心血管疾病或運動限制，請先諮詢專業人員。",
  },
  en: {
    badge: "Health · Exercise Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Swimming Calories Calculator", subtitle: "Estimate calories burned swimming from stroke, duration, and weight",
    intro: "This calculator uses the MET value of each stroke (freestyle/breaststroke/backstroke/butterfly/leisure), swim minutes, and body weight(kg) to estimate calories burned per session, plus weekly volume and a fat-equivalent reference.",
    trustNoteLabel: "Note:", trustNote: "MET values are population averages; actual burn depends on technique efficiency, water temperature, and rest time. Use the numbers for planning only.",
    quickActionCard: "Quick Action Card", tryExample: "Create a swim burn example instantly", examplePreview: "Per-session preview", examplePerson: "Weight", fillExample: "One-click standard example", previewActivePath: "Fill butterfly example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter stroke, duration, and weight", examplesHelper: "Start with an example to understand the calculation, then replace it with your own weight and swim time.",
    metric: "Metric (kg/min)", imperial: "Imperial (lb/min)", exampleCards: "Example cards", baselineExample: "Freestyle 30 min", activeExample: "Butterfly demo", baselineExampleNote: "70 kg · 30 min · ≈ 305 kcal", activeExampleNote: "70 kg · 20 min · ≈ 338 kcal", flowDemo: "70 kg", calculator: "Calculator",
    weight: "Body weight (kg)", minutes: "Swim minutes", mode: "Stroke", modeFree: "Freestyle", modeBreast: "Breaststroke", modeBack: "Backstroke", modeFly: "Butterfly", modeLeisure: "Leisure swim",
    resultCard: "Per-Session Burn Result", unit: "kcal/session", primaryValue: "This swim", maintenanceTarget: "Per minute", actionTarget: "Per week", estimatedTdee: "MET value", maintenance: "Per minute", fatLossTarget: "Weekly (3×)", fatLabel: "FAT",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card swim burn matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current per-session burn into common swim-training zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn swim burn into an actionable training plan", conversionNote: "L9 values update from the computed result: weekly volume, fat equivalent, and recovery hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current swim plan", dailyGap: "Per minute", weeklyTrend: "Fat equivalent (g)", motivation: "Motivation Card", keepMomentum: "Move from single sessions to consistent weekly volume",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's swim burn home", journeyHint: "Track weekly cumulative volume; swimming is joint-friendly and well-suited to long-term aerobic training.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Exercise Calories to compare land-based burn", nextActionItem2: "Use Max Heart Rate to match swim intensity zones", nextActionItem3: "Use TDEE to plan post-training energy balance",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Swim burn → Weekly volume → TDEE → Nutrition", bmrStep: "Swim burn", deficitStep: "Weekly volume", trendStep: "TDEE", mealStep: "Nutrition",
    knowledge: "Knowledge", knowledgeTitle: "What swim burn means in the Health universe", definition: "Definition", definitionText: "Swim burn is the energy expended above resting metabolism while moving in water; due to water resistance and heat loss, it often exceeds land exercise at the same intensity.", formula: "Formula", formulaText: "Burn(kcal) = MET × 3.5 × weight(kg) ÷ 200 × minutes. Freestyle MET≈8.3, breaststroke 10.3, backstroke 9.5, butterfly 13.8, leisure 6.0. Fat equivalent(g) = burn ÷ 7700 × 1000.", limitations: "Limitations", limitationsText: "MET is a population average; skilled swimmers are efficient and burn slightly less, beginners more due to inefficient strokes. Cold water also raises burn through extra heat loss.", interpretation: "Interpretation", interpretationText: "Butterfly and breaststroke burn more but are harder to sustain; freestyle suits steady endurance work. Long-term volume and diet drive weight change.", context: "Context", contextText: "Swim burn should be viewed with TDEE and nutrition: estimate weekly volume first, then plan diet.", example: "Example", exampleText: "Weight 70 kg, freestyle 30 min, MET 8.3 → 8.3 × 3.5 × 70 ÷ 200 × 30 ≈ 305 kcal." ,
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for swim training", premiumTitle: "PRO Swim Training Pack", premiumText: "Unlock weekly volume trends, stroke-efficiency analysis, interval workout generation, and recovery score reports.", feat1: "Volume", feat2: "Efficiency", feat3: "Intervals", feat4: "Recovery",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, exercise prescription, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Exercise Calories Calculator · Calorie Burn Calculator · Max Heart Rate Calculator · TDEE Calculator", references: "References", referencesText: "Compendium of Physical Activities (Ainsworth et al.); ACSM Guidelines for Exercise Testing and Prescription; WHO Physical Activity Guidelines.",
    q1: "Does swimming burn more than running?", a1: "It depends on intensity. Butterfly and fast freestyle can exceed running; leisure swimming is lower. Water resistance and heat loss often raise burn at the same heart rate.",
    q2: "Why does butterfly burn the most?", a2: "Butterfly has a large range of motion, whole-body coordination, and lower efficiency, giving it the highest MET among strokes—but most people sustain it only briefly.",
    q3: "Can swimming help with fat loss?", a3: "Yes. Swimming plus diet control widens the calorie deficit and is joint-friendly, making it suitable for heavier individuals over the long term.",
    q4: "How do I increase swim burn?", a4: "Add distance, raise speed, or include intervals; better technique lowers per-unit burn but lets you swim longer, raising total burn.",
    q5: "Does water temperature matter?", a5: "Yes. In cold water the body produces extra heat to stay warm, slightly raising burn—but deliberately swimming long in very cold water is not advised.",
    q6: "Can this tool diagnose fitness or disease?", a6: "No. It is an educational estimate; consult professionals for cardiovascular disease or exercise limitations.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SwimmingCaloriesCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [minutes, setMinutes] = useState("30");
  const [mode, setMode] = useState<StrokeMode>("freestyle");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const mins = Number(minutes);
    if (w <= 0 || mins <= 0) return null;
    const met = metFor(mode);
    const perMinute = (met * 3.5 * w) / 200;
    const totalKcal = perMinute * mins;
    const weeklyKcal = totalKcal * 3;
    const fatGrams = (totalKcal / 7700) * 1000;
    return { met, perMinute, totalKcal, weeklyKcal, fatGrams };
  }, [weight, minutes, mode]);

  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";
  const perMinDisplay = result ? fmt(result.perMinute, 1) : "—";
  const weeklyDisplay = result ? fmt(result.weeklyKcal, 0) : "—";
  const fatDisplay = result ? fmt(result.fatGrams, 1) : "—";
  const metDisplay = result ? fmt(result.met, 1) : "—";

  const activeBandKey = useMemo(() => {
    const v = result?.totalKcal ?? -1;
    if (v < 0) return "";
    if (v < 150) return "very-light";
    if (v < 300) return "light";
    if (v < 500) return "moderate";
    if (v < 700) return "high";
    if (v < 900) return "very-high";
    return "extreme";
  }, [result]);

  function fillStandard() { setUnit("metric"); setWeight("70"); setMinutes("30"); setMode("freestyle"); }
  function fillFly() { setUnit("metric"); setWeight("70"); setMinutes("20"); setMode("butterfly"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.minutes}</div><div className="font-black">{minutes}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">MET</div><div className="font-black">{metDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillFly} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">MET 8.3</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillFly} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">MET 13.8</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.minutes}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.mode}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as StrokeMode)}><option value="freestyle">{t.modeFree}</option><option value="breaststroke">{t.modeBreast}</option><option value="backstroke">{t.modeBack}</option><option value="butterfly">{t.modeFly}</option><option value="leisure">{t.modeLeisure}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{minutes} min</div><div className="mt-1 text-xs text-slate-300">MET {metDisplay}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{perMinDisplay}</p><p className="text-sm font-bold text-blue-700">kcal/min</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{weeklyDisplay}</p><p className="text-sm font-bold text-emerald-700">kcal</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.fatLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.weeklyTrend}</div><p className="mt-2 text-3xl font-black text-orange-950">{fatDisplay}</p><p className="text-sm font-bold text-orange-700">g</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBandKey === item.key ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="swim-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{perMinDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fatDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Swim", note: t.bmrStep }, { label: "Weekly", note: t.deficitStep }, { label: "TDEE", note: t.trendStep }, { label: "Nutrition", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="swim-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
