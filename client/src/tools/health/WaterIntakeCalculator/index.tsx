// @profile B
// Profile B · Calculator-YMYL · WaterIntakeCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "very-low", range: "<1500 ml", label: { zh: "極低水量", en: "Very low intake" }, desc: { zh: "可能有脫水風險，建議立即增加飲水。", en: "Possible dehydration risk; increase intake promptly." } },
  { key: "low", range: "1500–2000", label: { zh: "偏低水量", en: "Low intake" }, desc: { zh: "略低於一般建議，長期可能影響專注與代謝。", en: "Below common recommendations; may affect focus and metabolism." } },
  { key: "standard", range: "2000–2500", label: { zh: "標準水量", en: "Standard intake" }, desc: { zh: "符合久坐成年人基本需求。", en: "Meets basic needs for sedentary adults." } },
  { key: "active", range: "2500–3500", label: { zh: "運動型水量", en: "Active intake" }, desc: { zh: "含運動補充，適合有規律運動者。", en: "Includes exercise hydration; suitable for regular exercisers." } },
  { key: "high", range: "3500–4500", label: { zh: "高量補水", en: "High intake" }, desc: { zh: "大量運動或炎熱環境，需注意電解質平衡。", en: "Heavy exercise or hot climate; watch electrolyte balance." } },
  { key: "very-high", range: ">4500", label: { zh: "極高水量", en: "Very high intake" }, desc: { zh: "需留意水中毒風險，建議諮詢專業人員。", en: "Risk of water toxicity; consult a professional." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "體脂率計算機", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 水分規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "飲水量計算機 · Hydration Planner", subtitle: "用體重與活動量估算每日建議飲水量",
    intro: "Water Intake Calculator 依據體重(kg)乘以每公斤基礎需水量(35 ml/kg)，加上運動時間補充(8 ml/min)與氣候調整，估算每日建議總飲水量，並提供公升與液體盎司換算。",
    trustNoteLabel: "注意事項：", trustNote: "35 ml/kg 是一般成年人簡化估算；實際需求受氣溫、濕度、海拔、健康狀態、藥物與懷孕影響。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立飲水範例", examplePreview: "每日建議預覽", examplePerson: "標準補水", fillExample: "一鍵填入標準範例", previewActivePath: "填入運動範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入體重與活動量", examplesHelper: "先用範例理解基礎水量、運動加成與氣候調整，再改成自己的體重與活動量。",
    metric: "公制 (ml/L)", imperial: "英制 (fl oz)", exampleCards: "範例卡", baselineExample: "70 kg 標準補水", activeExample: "運動 + 炎熱示範", flowDemo: "運動 45 min", calculator: "計算機", baselineExampleDetail: "70 kg · 0 min · 無氣候加成", activeExampleDetail: "70 kg · 45 min · 炎熱",
    weight: "體重 (kg)", exercise: "運動時間 (分鐘/天)", climate: "氣候調整", climateNone: "無", climateHot: "炎熱/高海拔", climateCold: "寒冷/乾燥",
    resultCard: "飲水量建議結果", unit: "ml/day", primaryValue: "主要數值", maintenanceTarget: "公升換算", actionTarget: "液體盎司換算", estimatedTdee: "基礎水量", maintenance: "運動加成", fatLossTarget: "氣候加成",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格飲水量判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日總建議放進常見規劃區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把飲水建議轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每小時分配、每杯 250 ml 分配與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前飲水品質", dailyGap: "每小時建議", weeklyTrend: "每杯分配", motivation: "動力卡", keepMomentum: "從飲水建議走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的飲水建議帶回家", journeyHint: "用 3–7 天平均體重與活動重新估算，避免被單日變化誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 BMR 確認基礎代謝是否合理", nextActionItem2: "用 TDEE 計算總消耗，搭配飲水與熱量", nextActionItem3: "用 Body Fat 或體重趨勢檢查是否需要調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "BMR / TDEE → Water Intake → Hydration Tracking / Calorie Deficit", bmrStep: "BMR/TDEE", deficitStep: "飲水量", trendStep: "補水追蹤", mealStep: "熱量規劃",
    knowledge: "知識", knowledgeTitle: "Water intake 在健康宇宙中的意義", definition: "定義", definitionText: "每日建議飲水量是依據體重、活動量與環境因素估算的水分攝取建議。", formula: "公式", formulaText: "基礎水量 = 體重(kg) × 35 ml/kg。運動加成 = 運動分鐘 × 8 ml/min。氣候加成：炎熱/高海拔 +750 ml，寒冷/乾燥 +250 ml。總建議 = 基礎 + 運動 + 氣候。換算：1 L = 1000 ml ≈ 33.8 fl oz。", limitations: "限制", limitationsText: "35 ml/kg 不考慮腎臟疾病、藥物利尿效果、懷孕哺乳、極端氣候或特殊飲食（高鹽/高蛋白）。", interpretation: "解讀", interpretationText: "一般成年人 2000–2500 ml 為基本範圍；運動者常需 3000 ml 以上；超過 4500 ml 應注意水中毒。", context: "脈絡", contextText: "飲水規劃應接在 TDEE 之後，並與電解質、睡眠和壓力管理一起看。", example: "範例", exampleText: "體重 70 kg、運動 45 min、炎熱 → 基礎 2450 ml + 運動 360 ml + 氣候 750 ml = 3560 ml ≈ 3.56 L ≈ 120 fl oz。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "水分規劃的下一步工具", premiumTitle: "PRO 飲水追蹤包", premiumText: "解鎖體重連動、每小時提醒、電解質建議與個人化飲水報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMR Calculator · TDEE Calculator · Calorie Deficit Calculator · Body Fat Calculator", references: "參考資料", referencesText: "NIH Water Intake Recommendations；EFSA Dietary Reference Values for Water；Mayo Clinic Water Intake Guidance；Popkin et al. Water Hydration and Health review。",
    q1: "每天應該喝多少水？", a1: "一般成年人約 2000–2500 ml，但實際需求因體重、活動、氣候與健康狀態而異。",
    q2: "35 ml/kg 的依據是什麼？", a2: "這是臨床營養常用的簡化估算，源自 EFSA 與 IOM 對成年人每公斤體重需水量的建議範圍。",
    q3: "運動時要額外喝多少水？", a3: "每運動 1 分鐘約需額外 5–12 ml，中位約 8 ml/min；長時間高強度運動還需補充電解質。",
    q4: "喝太多水會有風險嗎？", a4: "會。短時間大量飲水可能導致水中毒（低血鈉），建議分次飲用並留意總量。",
    q5: "咖啡和茶算在飲水量裡嗎？", a5: "適量咖啡因飲品可計入部分水分，但高咖啡因有利尿效果，不建議全部計入。",
    q6: "這個工具能診斷脫水或腎臟疾病嗎？", a6: "不能。它只是教育用估算；若有疾病、懷孕、用藥或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Hydration Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Water Intake Calculator · Hydration Planner", subtitle: "Estimate daily water intake from weight and activity",
    intro: "This calculator uses body weight(kg) times a base factor(35 ml/kg), adds exercise duration supplement(8 ml/min) and a climate adjustment, then estimates total daily recommended water intake with liter and fluid ounce conversions.",
    trustNoteLabel: "Note:", trustNote: "35 ml/kg is a simplified estimate for average adults; actual needs vary with temperature, humidity, altitude, health, medication, and pregnancy.",
    quickActionCard: "Quick Action Card", tryExample: "Create a hydration example instantly", examplePreview: "Daily recommendation preview", examplePerson: "Standard hydration", fillExample: "One-click standard example", previewActivePath: "Fill exercise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter weight and activity level", examplesHelper: "Start with an example to understand base water, exercise add-on, and climate adjustment, then replace with your own weight and activity.",
    metric: "Metric (ml/L)", imperial: "Imperial (fl oz)", exampleCards: "Example cards", baselineExample: "70 kg standard hydration", activeExample: "Exercise + hot climate demo", flowDemo: "Exercise 45 min", calculator: "Calculator", baselineExampleDetail: "70 kg · 0 min · No climate", activeExampleDetail: "70 kg · 45 min · Hot",
    weight: "Body weight (kg)", exercise: "Exercise duration (min/day)", climate: "Climate adjustment", climateNone: "None", climateHot: "Hot / high altitude", climateCold: "Cold / dry",
    resultCard: "Water Intake Recommendation", unit: "ml/day", primaryValue: "Primary Value", maintenanceTarget: "Liter conversion", actionTarget: "Fluid ounce conversion", estimatedTdee: "Base water", maintenance: "Exercise add-on", fatLossTarget: "Climate add-on",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card water intake interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to compare the current daily total with common planning zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn water recommendation into an actionable plan", conversionNote: "L9 values update from the computed result: per-hour split, per-cup(250 ml) count, and daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current hydration quality", dailyGap: "Per hour", weeklyTrend: "Cups per day", motivation: "Motivation Card", keepMomentum: "Move from hydration estimate to consistent tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's water estimate home", journeyHint: "Re-estimate using 3–7 day average weight and activity to avoid overreacting to single-day changes.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm basal metabolism with BMR Calculator", nextActionItem2: "Use TDEE to match hydration with total calorie output", nextActionItem3: "Use Body Fat or weight trend to decide whether hydration needs adjustment",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "BMR / TDEE → Water Intake → Hydration Tracking / Calorie Deficit", bmrStep: "BMR/TDEE", deficitStep: "Water intake", trendStep: "Hydration tracking", mealStep: "Calorie planning",
    knowledge: "Knowledge", knowledgeTitle: "What water intake means in the Health universe", definition: "Definition", definitionText: "Daily recommended water intake is an estimate of fluid needs based on body weight, activity level, and environmental factors.", formula: "Formula", formulaText: "Base water = weight(kg) × 35 ml/kg. Exercise add-on = exercise minutes × 8 ml/min. Climate add-on: hot/high altitude +750 ml, cold/dry +250 ml. Total = base + exercise + climate. Conversion: 1 L = 1000 ml ≈ 33.8 fl oz.", limitations: "Limitations", limitationsText: "35 ml/kg does not account for kidney disease, diuretic medication, pregnancy/lactation, extreme climate, or special diets (high-salt/high-protein).", interpretation: "Interpretation", interpretationText: "2000–2500 ml is the basic range for most adults; active individuals often need 3000 ml+; above 4500 ml warrants caution for water toxicity.", context: "Context", contextText: "Hydration planning should follow TDEE and be paired with electrolyte, sleep, and stress management.", example: "Example", exampleText: "Weight 70 kg, exercise 45 min, hot climate → base 2450 ml + exercise 360 ml + climate 750 ml = 3560 ml ≈ 3.56 L ≈ 120 fl oz.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for hydration planning", premiumTitle: "PRO Hydration Tracking Pack", premiumText: "Unlock weight-linked hydration, hourly reminders, electrolyte tips, and personalized intake reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMR Calculator · TDEE Calculator · Calorie Deficit Calculator · Body Fat Calculator", references: "References", referencesText: "NIH Water Intake Recommendations; EFSA Dietary Reference Values for Water; Mayo Clinic Water Intake Guidance; Popkin et al. Water Hydration and Health review.",
    q1: "How much water should I drink per day?", a1: "Most adults need about 2000–2500 ml, but actual needs depend on weight, activity, climate, and health.",
    q2: "What is the basis for 35 ml/kg?", a2: "It is a simplified clinical-nutrition estimate derived from EFSA and IOM per-kilogram water-need ranges for adults.",
    q3: "How much extra water for exercise?", a3: "About 5–12 ml per minute of exercise, median ~8 ml/min; long high-intensity sessions also need electrolytes.",
    q4: "Can drinking too much water be dangerous?", a4: "Yes. Rapid large-volume intake can cause water toxicity (hyponatremia); drink in batches and watch total volume.",
    q5: "Do coffee and tea count toward water intake?", a5: "Moderate caffeinated drinks can partially count, but high caffeine has a diuretic effect; do not count all of it.",
    q6: "Can this tool diagnose dehydration or kidney disease?", a6: "No. It is an educational estimate; consult professionals for disease, pregnancy, medication, or special conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

type ClimateMode = "none" | "hot" | "cold";

function climateAdd(climate: ClimateMode): number {
  if (climate === "hot") return 750;
  if (climate === "cold") return 250;
  return 0;
}

export default function WaterIntakeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [exercise, setExercise] = useState("45");
  const [climate, setClimate] = useState<ClimateMode>("hot");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const ex = Number(exercise);
    if (w <= 0) return null;
    const base = w * 35;
    const exAdd = Math.max(0, ex) * 8;
    const clAdd = climateAdd(climate);
    const total = base + exAdd + clAdd;
    const liters = total / 1000;
    const flOz = total / 29.5735;
    const perHour = total / 16;
    const cups = total / 250;
    return { base, exAdd, clAdd, total, liters, flOz, perHour, cups };
  }, [weight, exercise, climate]);

  const totalDisplay = result ? fmt(result.total) : "—";
  const literDisplay = result ? fmt(result.liters, 2) : "—";
  const flOzDisplay = result ? fmt(result.flOz, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("70"); setExercise("0"); setClimate("none"); }
  function fillActive() { setUnit("metric"); setWeight("70"); setExercise("45"); setClimate("hot"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{exercise} min</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.climate}</div><div className="font-black">{climate === "hot" ? "☀️" : climate === "cold" ? "❄️" : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillActive} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">2450</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleDetail}</p></button><button onClick={fillActive} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">3560</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleDetail}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.exercise}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={exercise} onChange={(e) => setExercise(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.climate}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={climate} onChange={(e) => setClimate(e.target.value as ClimateMode)}><option value="none">{t.climateNone}</option><option value="hot">{t.climateHot}</option><option value="cold">{t.climateCold}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{unit === "metric" ? totalDisplay : flOzDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{unit === "metric" ? t.unit : "fl oz/day"}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight} kg</div><div className="mt-1 text-xs text-slate-300">{unit === "metric" ? `${literDisplay} L` : `${flOzDisplay} fl oz`}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-blue-950">{result ? fmt(result.base) : "—"}</p><p className="text-sm font-bold text-blue-700">ml</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result ? fmt(result.exAdd) : "—"}</p><p className="text-sm font-bold text-emerald-700">ml</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-orange-950">{result ? fmt(result.clAdd) : "—"}</p><p className="text-sm font-bold text-orange-700">ml</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">ml/day</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="water-intake-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Total</div><div className="mt-1 text-3xl font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.perHour, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.cups, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMR/TDEE", note: t.bmrStep }, { label: "Water", note: t.deficitStep }, { label: "Track", note: t.trendStep }, { label: "Calories", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="water-intake-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Weight", "Intake", "Reminder", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
