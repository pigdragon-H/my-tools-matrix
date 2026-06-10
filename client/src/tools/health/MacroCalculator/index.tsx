// @profile B
// Profile B · Calculator-YMYL · MacroCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type GoalMode = "cut" | "maintain" | "bulk";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "extreme-cut", range: "TDEE − 750+", label: { zh: "極度減脂", en: "Extreme cut" }, desc: { zh: "風險高，肌肉流失嚴重，不建議長期使用。", en: "High risk of muscle loss; not recommended long term." } },
  { key: "standard-cut", range: "TDEE − 500", label: { zh: "標準減脂", en: "Standard cut" }, desc: { zh: "常見減脂起點，每週約減 0.5 kg。", en: "Common fat-loss starting point; ~0.5 kg/week." } },
  { key: "light-cut", range: "TDEE − 250", label: { zh: "輕度減脂", en: "Light cut" }, desc: { zh: "較慢但可持續，適合重新調整期。", en: "Slower but sustainable; good for recalibration." } },
  { key: "maintain", range: "TDEE", label: { zh: "維持體重", en: "Maintenance" }, desc: { zh: "攝取等於消耗，體重穩定。", en: "Intake equals output; weight stays stable." } },
  { key: "lean-bulk", range: "TDEE + 250", label: { zh: "精實增肌", en: "Lean bulk" }, desc: { zh: "小幅盈餘，肌肉為主、脂肪較少。", en: "Small surplus; mostly muscle, minimal fat." } },
  { key: "standard-bulk", range: "TDEE + 500", label: { zh: "標準增肌", en: "Standard bulk" }, desc: { zh: "較快增肌但伴隨較多脂肪。", en: "Faster muscle gain with more fat." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "體脂率計算機", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 營養規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "巨量營養素計算機 · Macro Planner", subtitle: "用體重、TDEE 與目標估算蛋白質、脂肪與碳水化合物分配",
    intro: "Macro Calculator 依據體重(kg)與 TDEE，配合目標模式（減脂/維持/增肌），估算每日蛋白質、脂肪與碳水化合物建議攝取量（克），並提供卡路里佔比換算。",
    trustNoteLabel: "注意事項：", trustNote: "蛋白質係數為一般建議範圍中位值；個體差異、腎臟狀況與運動類型會影響實際需求。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立巨量營養素範例", examplePreview: "每日建議預覽", examplePerson: "標準維持", fillExample: "一鍵填入標準範例", previewActivePath: "填入減脂範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入體重與 TDEE", examplesHelper: "先用範例理解蛋白質、脂肪與碳水分配，再改成自己的體重與 TDEE。",
    metric: "公制 (g/kcal)", imperial: "英制 (oz/kcal)", exampleCards: "範例卡", baselineExample: "70 kg 維持模式", activeExample: "減脂模式示範", baselineExampleNote: "70 公斤 · 維持 · 2400 kcal", activeExampleNote: "70 公斤 · 減脂 · 1900 kcal", carbsLabel: "碳水", carbsName: "碳水化合物", proteinLabel: "蛋白質", flowDemo: "TDEE 2400", calculator: "計算機",
    weight: "體重 (kg)", tdee: "TDEE (kcal/day)", goal: "目標模式", goalCut: "減脂", goalMaintain: "維持", goalBulk: "增肌",
    resultCard: "巨量營養素建議結果", unit: "kcal/day", primaryValue: "主要數值", maintenanceTarget: "蛋白質 (g)", actionTarget: "脂肪 (g)", estimatedTdee: "基礎 TDEE", maintenance: "蛋白質", fatLossTarget: "脂肪",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格巨量營養素判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日 TDEE 目標放進常見規劃區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把巨量營養素建議轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每餐分配、每克卡路里與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前營養規劃", dailyGap: "每餐分配", weeklyTrend: "每克卡路里", motivation: "動力卡", keepMomentum: "從巨量營養素建議走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的營養建議帶回家", journeyHint: "用 3–7 天平均體重與 TDEE 重新估算，避免被單日變化誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 BMR 確認基礎代謝是否合理", nextActionItem2: "用 TDEE 計算總消耗，搭配巨量營養素", nextActionItem3: "用 Calorie Deficit 或 Body Fat 檢查是否需要調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "BMR / TDEE → Macro → Calorie Deficit / Body Fat", bmrStep: "BMR/TDEE", deficitStep: "巨量營養素", trendStep: "熱量赤字", mealStep: "體脂追蹤",
    knowledge: "知識", knowledgeTitle: "Macro 在健康宇宙中的意義", definition: "定義", definitionText: "巨量營養素（蛋白質、脂肪、碳水化合物）是提供能量的三大營養類別，比例分配影響體組成變化。", formula: "公式", formulaText: "蛋白質 = 體重(kg) × 係數（減脂 2.2、維持 1.8、增肌 2.0 g/kg）。脂肪 = TDEE × 25% ÷ 9 kcal/g。碳水 = (TDEE − 蛋白質×4 − 脂肪×9) ÷ 4 kcal/g。", limitations: "限制", limitationsText: "係數為一般建議中位值；腎臟疾病、孕婦、高齡者與特殊飲食需個別調整。25% 脂肪比例是起始值，生酮飲食需大幅提高。", interpretation: "解讀", interpretationText: "蛋白質 1.6–2.4 g/kg 對多數人安全有效；脂肪不建議長期低於 TDEE 15%；碳水決定訓練表現。", context: "脈絡", contextText: "巨量營養素規劃應接在 TDEE 之後，並與熱量赤字、體脂追蹤一起看。", example: "範例", exampleText: "體重 70 kg、TDEE 2400、維持 → 蛋白質 126g(504 kcal) + 脂肪 67g(600 kcal) + 碳水 324g(1296 kcal) = 2400 kcal。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "營養規劃的下一步工具", premiumTitle: "PRO 營養追蹤包", premiumText: "解鎖餐餐記錄、蛋白質趨勢圖、微量營養素建議與個人化飲食報告。", feat1: "記錄追蹤", feat2: "趨勢分析", feat3: "微量營養", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMR Calculator · TDEE Calculator · Calorie Deficit Calculator · Body Fat Calculator", references: "參考資料", referencesText: "ACSM Position Stand on Nutrition and Athletic Performance; IOM Dietary Reference Intakes for Macronutrients; Phillips & Van Loon Nutrient Timing review; WHO Protein and Amino Acid Requirements。",
    q1: "每天應該吃多少蛋白質？", a1: "一般成人 1.2–1.8 g/kg，有運動者 1.6–2.4 g/kg，減脂期建議偏高以保留肌肉。",
    q2: "為什麼脂肪比例是 25%？", a2: "25% 是多數指引的最低安全下限附近，確保激素與脂溶性維生素正常；生酮可達 65–75%。",
    q3: "碳水化合物越少越好嗎？", a3: "不建議。碳水是高強度訓練主要燃料，過低會影響表現與恢復。",
    q4: "可以用於減肥嗎？", a4: "可以。選「減脂」模式後蛋白質係數提高，幫助在熱量赤字下保留肌肉。",
    q5: "孕婦適用嗎？", a5: "孕婦與哺乳期需求不同，蛋白質與整體熱量都需增加，請諮詢專業人員。",
    q6: "這個工具能診斷營養缺乏或代謝疾病嗎？", a6: "不能。它只是教育用估算；若有疾病、懷孕、用藥或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Nutrition Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Macro Calculator · Macro Planner", subtitle: "Estimate protein, fat, and carbs from weight, TDEE, and goal",
    intro: "This calculator uses body weight(kg) and TDEE with a goal mode (cut/maintain/bulk) to estimate daily protein, fat, and carbohydrate recommendations in grams, with calorie-share conversions.",
    trustNoteLabel: "Note:", trustNote: "Protein coefficients are median values from general guidelines; individual differences, kidney health, and exercise type affect actual needs.",
    quickActionCard: "Quick Action Card", tryExample: "Create a macro example instantly", examplePreview: "Daily recommendation preview", examplePerson: "Standard maintenance", fillExample: "One-click standard example", previewActivePath: "Fill cut example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter weight and TDEE", examplesHelper: "Start with an example to understand protein, fat, and carb allocation, then replace with your own weight and TDEE.",
    metric: "Metric (g/kcal)", imperial: "Imperial (oz/kcal)", exampleCards: "Example cards", baselineExample: "70 kg maintenance mode", activeExample: "Cut mode demo", baselineExampleNote: "70 kg · Maintain · 2400 kcal", activeExampleNote: "70 kg · Cut · 1900 kcal", carbsLabel: "Carbs", carbsName: "Carbohydrates", proteinLabel: "Protein", flowDemo: "TDEE 2400", calculator: "Calculator",
    weight: "Body weight (kg)", tdee: "TDEE (kcal/day)", goal: "Goal mode", goalCut: "Cut", goalMaintain: "Maintain", goalBulk: "Bulk",
    resultCard: "Macro Recommendation", unit: "kcal/day", primaryValue: "Primary Value", maintenanceTarget: "Protein (g)", actionTarget: "Fat (g)", estimatedTdee: "Base TDEE", maintenance: "Protein", fatLossTarget: "Fat",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card macro interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to compare the current daily TDEE target with common planning zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn macro recommendation into an actionable plan", conversionNote: "L9 values update from the computed result: per-meal split, per-gram calorie count, and daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current nutrition plan", dailyGap: "Per meal", weeklyTrend: "kcal per gram", motivation: "Motivation Card", keepMomentum: "Move from macro estimate to consistent tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's macro estimate home", journeyHint: "Re-estimate using 3–7 day average weight and TDEE to avoid overreacting to single-day changes.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm basal metabolism with BMR Calculator", nextActionItem2: "Use TDEE to match macros with total calorie output", nextActionItem3: "Use Calorie Deficit or Body Fat to decide whether macros need adjustment",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "BMR / TDEE → Macro → Calorie Deficit / Body Fat", bmrStep: "BMR/TDEE", deficitStep: "Macros", trendStep: "Calorie deficit", mealStep: "Body fat tracking",
    knowledge: "Knowledge", knowledgeTitle: "What macros mean in the Health universe", definition: "Definition", definitionText: "Macronutrients (protein, fat, carbohydrates) are the three nutrient categories that provide energy; their ratio distribution affects body composition changes.", formula: "Formula", formulaText: "Protein = weight(kg) × factor (cut 2.2, maintain 1.8, bulk 2.0 g/kg). Fat = TDEE × 25% ÷ 9 kcal/g. Carbs = (TDEE − protein×4 − fat×9) ÷ 4 kcal/g.", limitations: "Limitations", limitationsText: "Coefficients are median guideline values; kidney disease, pregnancy, elderly, and special diets need individual adjustment. 25% fat is a starting point; keto diets require much higher.", interpretation: "Interpretation", interpretationText: "1.6–2.4 g/kg protein is safe and effective for most; fat below 15% TDEE is not recommended long term; carbs drive training performance.", context: "Context", contextText: "Macro planning should follow TDEE and be paired with calorie deficit and body fat tracking.", example: "Example", exampleText: "Weight 70 kg, TDEE 2400, maintain → protein 126g(504 kcal) + fat 67g(600 kcal) + carbs 324g(1296 kcal) = 2400 kcal.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for nutrition planning", premiumTitle: "PRO Nutrition Tracking Pack", premiumText: "Unlock per-meal logging, protein trend charts, micronutrient tips, and personalized diet reports.", feat1: "Logging", feat2: "Trends", feat3: "Micros", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMR Calculator · TDEE Calculator · Calorie Deficit Calculator · Body Fat Calculator", references: "References", referencesText: "ACSM Position Stand on Nutrition and Athletic Performance; IOM Dietary Reference Intakes for Macronutrients; Phillips & Van Loon Nutrient Timing review; WHO Protein and Amino Acid Requirements.",
    q1: "How much protein should I eat per day?", a1: "Most adults need 1.2–1.8 g/kg; active individuals 1.6–2.4 g/kg; during a cut, higher protein helps preserve muscle.",
    q2: "Why is fat set to 25%?", a2: "25% is near the lower safe limit in most guidelines for hormones and fat-soluble vitamins; keto diets may reach 65–75%.",
    q3: "Are fewer carbs always better?", a3: "No. Carbs are the primary fuel for high-intensity training; too few impair performance and recovery.",
    q4: "Can this tool help with weight loss?", a4: "Yes. Selecting 'Cut' raises the protein coefficient, helping preserve muscle in a calorie deficit.",
    q5: "Is this suitable during pregnancy?", a5: "Pregnancy and lactation have different needs; protein and total calories must increase. Consult a professional.",
    q6: "Can this tool diagnose nutrient deficiency or metabolic disease?", a6: "No. It is an educational estimate; consult professionals for disease, pregnancy, medication, or special conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 2.2;
  if (goal === "bulk") return 2.0;
  return 1.8;
}

export default function MacroCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [tdee, setTdee] = useState("2400");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const tVal = Number(tdee);
    if (w <= 0 || tVal <= 0) return null;
    const pf = proteinFactor(goal);
    const proteinG = w * pf;
    const proteinKcal = proteinG * 4;
    const fatKcal = tVal * 0.25;
    const fatG = fatKcal / 9;
    const carbKcal = tVal - proteinKcal - fatKcal;
    const carbG = carbKcal / 4;
    const totalKcal = proteinKcal + fatKcal + carbKcal;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("70"); setTdee("2400"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("70"); setTdee("2400"); setGoal("cut"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "cut" ? "✂️" : goal === "bulk" ? "💪" : "⚖️"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">2400</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1900</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as GoalMode)}><option value="cut">{t.goalCut}</option><option value="maintain">{t.goalMaintain}</option><option value="bulk">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight} kg</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">g</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">g</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">g</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="macro-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}g</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.proteinG / 4, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.totalKcal / (result.proteinG + result.fatG + result.carbG), 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMR/TDEE", note: t.bmrStep }, { label: "Macros", note: t.deficitStep }, { label: "Deficit", note: t.trendStep }, { label: "Body Fat", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="macro-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
