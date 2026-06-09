// @profile B
// Profile B · Calculator-YMYL · ProteinCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Goal = "sedentary" | "light" | "moderate" | "strength" | "athlete";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const goalFactor: Record<Goal, number> = { sedentary: 0.8, light: 1.2, moderate: 1.6, strength: 2.0, athlete: 2.2 };

const bands = [
  { key: "low", max: 60, label: { zh: "基礎量", en: "Baseline" }, range: "≤ 60g", desc: { zh: "接近 RDA 下限，維持基本生理機能即可。", en: "Near the RDA floor; covers basic physiological needs." } },
  { key: "general", max: 90, label: { zh: "一般活動", en: "General" }, range: "61–90g", desc: { zh: "輕度活動者的常見區間，支撐日常與輕運動。", en: "Common range for lightly active people; supports daily light exercise." } },
  { key: "active", max: 120, label: { zh: "活躍", en: "Active" }, range: "91–120g", desc: { zh: "規律運動族群，幫助恢復與肌肉維持。", en: "Regular exercisers; aids recovery and muscle maintenance." } },
  { key: "build", max: 160, label: { zh: "增肌", en: "Muscle-building" }, range: "121–160g", desc: { zh: "阻力訓練增肌期的典型攝取，分多餐效果佳。", en: "Typical for resistance-training hypertrophy; spread across meals." } },
  { key: "high", max: 200, label: { zh: "高需求", en: "High demand" }, range: "161–200g", desc: { zh: "運動員或減脂保肌期，需搭配充足熱量管理。", en: "Athletes or muscle-sparing cuts; pair with calorie management." } },
  { key: "extreme", max: Infinity, label: { zh: "極高量", en: "Very high" }, range: "200g+", desc: { zh: "超過多數人需求，注意腎臟健康與飲食均衡。", en: "Beyond most people's needs; mind kidney health and balance." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "乳清蛋白", en: "Whey Protein" }, href: "https://www.amazon.com/s?k=whey+protein" },
  { label: { zh: "植物蛋白粉", en: "Plant Protein Powder" }, href: "https://www.amazon.com/s?k=plant+protein+powder" },
  { label: { zh: "電子廚房秤", en: "Kitchen Food Scale" }, href: "https://www.amazon.com/s?k=kitchen+food+scale" },
  { label: { zh: "搖搖杯", en: "Shaker Bottle" }, href: "https://www.amazon.com/s?k=protein+shaker+bottle" },
];

const ui = {
  zh: {
    badge: "營養 · 蛋白質 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "蛋白質需求計算機 · Protein Planner", subtitle: "用體重與活動／訓練目標估算每日蛋白質與每餐分配",
    intro: "Protein Calculator 依體重(kg)與活動／訓練目標，估算每日蛋白質建議攝取量（公克），並換算每餐分配與常見食物份量參考。",
    trustNoteLabel: "注意事項：", trustNote: "建議量為族群平均；腎功能異常、孕期或特殊疾病者請先諮詢醫師或營養師。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立蛋白質範例", examplePreview: "每日蛋白質預覽", examplePerson: "活動目標", fillExample: "一鍵填入標準範例", previewActivePath: "填入增肌範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入體重與目標", examplesHelper: "先用範例理解算法，再換成您自己的體重與訓練目標。",
    metric: "中度活動", imperial: "重量訓練", exampleCards: "範例卡", baselineExample: "70kg · 中度 · 1.6 g/kg", activeExample: "70kg · 重訓 · 2.0 g/kg", dailyLabel: "每日", flowDemo: "每日餐數", calculator: "計算機",
    weight: "體重（公斤）", tdee: "每日餐數", goal: "活動／目標", goalCut: "中度活動", goalMaintain: "重量訓練", goalBulk: "運動員／減脂保肌",
    resultCard: "您的蛋白質需求結果", unit: "公克/天", primaryValue: "目前設定", maintenanceTarget: "每餐約", actionTarget: "乳清匙數", estimatedTdee: "每日蛋白質", maintenance: "每餐分配", fatLossTarget: "乳清匙",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格蛋白質需求判讀矩陣", tdeeMatrixNote: "L7 用六格強度帶，將目前每日蛋白質放進常見需求區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把蛋白質需求轉成可執行餐盤", conversionNote: "L9 會連動目前計算結果，顯示每餐分配、乳清匙數與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前蛋白質規劃", dailyGap: "每餐約", weeklyTrend: "乳清匙數", motivation: "動力卡", keepMomentum: "從蛋白質估算走向穩定達標",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的蛋白質目標帶回家", journeyHint: "以一週為單位觀察體重與恢復，必要時微調係數，避免被單日波動誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 TDEE 確認總熱量是否足夠", nextActionItem2: "用 Macro 搭配蛋白質做完整營養分配", nextActionItem3: "用 Body Fat 或 Calorie Deficit 檢查是否需調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "體重 → 蛋白質 → 每餐分配 → 飲食追蹤", bmrStep: "體重", deficitStep: "蛋白質", trendStep: "每餐", mealStep: "追蹤",
    knowledge: "知識", knowledgeTitle: "蛋白質在健康宇宙中的意義", definition: "定義", definitionText: "蛋白質是組成肌肉、酵素與荷爾蒙的關鍵營養素，攝取量影響肌肉合成、恢復與飽足感。", formula: "公式", formulaText: "每日蛋白質 = 體重(kg) × 活動係數（久坐 0.8、輕度 1.2、中度 1.6、重訓 2.0、運動員 2.2 g/kg）。每餐 = 每日 ÷ 餐數。乳清匙數 = 每日 ÷ 25g。", limitations: "限制", limitationsText: "係數為族群平均；腎臟疾病、孕期、高齡與特殊飲食需個別調整。優先以天然食物攝取，補充劑只補缺口。", interpretation: "解讀", interpretationText: "1.6–2.2 g/kg 對多數運動者安全有效；每餐約 20–40g 吸收效率較佳；過量並不會額外增肌。", context: "脈絡", contextText: "蛋白質規劃應與 TDEE、Macro 與訓練量一起看，先定每日量，再排每餐與食物來源。", example: "範例", exampleText: "體重 70kg、中度活動 1.6 → 每日 112g，分 4 餐每餐 28g，約 4.5 匙乳清。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "蛋白質規劃的下一步補給", premiumTitle: "PRO 蛋白追蹤包", premiumText: "解鎖分餐排程、食物蛋白質資料庫、每週達標追蹤與個人化餐盤報告。", feat1: "餐食規劃", feat2: "資料庫", feat3: "依從度", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具以『每公斤體重 × 活動係數』估算每日蛋白質，對應 RDA 與運動營養共識，僅供教育與規劃用途，不取代專業建議。", relatedTools: "相關工具", relatedToolsText: "TDEE Calculator · Macro Calculator · Body Fat Calculator · Workout Plan Calculator", references: "參考資料", referencesText: "ISSN 蛋白質與運動立場聲明；美國膳食營養素參考攝取量（DRI）；Phillips 蛋白質需求綜述。",
    q1: "一天要吃多少蛋白質？", a1: "依目標而定：久坐約 0.8、規律運動 1.2–1.6、增肌或減脂保肌 1.6–2.2 g/kg 體重。本工具依您的選擇估算。",
    q2: "蛋白質要分餐吃嗎？", a2: "建議分 3–5 餐、每餐約 20–40g，較能持續刺激肌肉合成，比一次大量更有效率。",
    q3: "哪些是優質來源？", a3: "蛋、乳製品、瘦肉、魚、黃豆製品與乳清屬高生物價；植物來源建議多樣搭配以補齊胺基酸。",
    q4: "高蛋白傷腎嗎？", a4: "對腎功能正常者一般安全；但腎臟疾病患者應遵醫囑限量，並維持充足水分。",
    q5: "補充劑必要嗎？", a5: "不必要。先從天然食物攝取，若達不到目標再用蛋白粉補足缺口，方便且划算。",
    q6: "這個工具能當醫療或營養處方嗎？", a6: "不能。它只是教育用估算；有疾病、懷孕、用藥或特殊狀況請諮詢醫師或營養師。",
  },
  en: {
    badge: "Nutrition · Protein · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Protein Calculator · Protein Planner", subtitle: "Estimate daily protein and per-meal split from weight and goal",
    intro: "This calculator uses body weight(kg) and activity/training goal to estimate your daily protein target in grams, plus per-meal distribution and common food references.",
    trustNoteLabel: "Note:", trustNote: "Targets are population averages; if you have kidney issues, are pregnant, or have special conditions, consult a doctor or dietitian first.",
    quickActionCard: "Quick Action Card", tryExample: "Create a protein example instantly", examplePreview: "Daily protein preview", examplePerson: "Activity goal", fillExample: "One-click standard example", previewActivePath: "Fill muscle-building example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter weight and goal", examplesHelper: "Start with an example to understand the math, then swap in your own weight and goal.",
    metric: "Moderate", imperial: "Strength", exampleCards: "Example cards", baselineExample: "70kg · Moderate · 1.6 g/kg", activeExample: "70kg · Strength · 2.0 g/kg", dailyLabel: "Daily", flowDemo: "Meals/day", calculator: "Calculator",
    weight: "Body weight (kg)", tdee: "Meals per day", goal: "Activity / goal", goalCut: "Moderately active", goalMaintain: "Strength training", goalBulk: "Athlete / muscle-sparing cut",
    resultCard: "Your protein needs", unit: "grams/day", primaryValue: "Current setup", maintenanceTarget: "Per meal approx.", actionTarget: "Whey scoops", estimatedTdee: "Daily protein", maintenance: "Per-meal split", fatLossTarget: "Whey scoops",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card protein demand matrix", tdeeMatrixNote: "L7 uses six intensity bands to place the current daily protein into common demand zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn protein needs into an actionable plate", conversionNote: "L9 values update from the computed result: per-meal split, whey scoops, and daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current protein plan", dailyGap: "Per meal approx.", weeklyTrend: "Whey scoops", motivation: "Motivation Card", keepMomentum: "Move from estimate to consistent targets",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's protein target home", journeyHint: "Track weight and recovery weekly and tweak the factor if needed, so single-day swings don't mislead you.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use TDEE to confirm total calories are sufficient", nextActionItem2: "Use Macro to complete the full nutrient split with protein", nextActionItem3: "Use Body Fat or Calorie Deficit to decide whether to adjust",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Weight → Protein → Per-meal split → Diet tracking", bmrStep: "Weight", deficitStep: "Protein", trendStep: "Per meal", mealStep: "Tracking",
    knowledge: "Knowledge", knowledgeTitle: "What protein means in the Health universe", definition: "Definition", definitionText: "Protein is the key nutrient building muscle, enzymes, and hormones; intake affects muscle synthesis, recovery, and satiety.", formula: "Formula", formulaText: "Daily protein = weight(kg) × activity factor (sedentary 0.8, light 1.2, moderate 1.6, strength 2.0, athlete 2.2 g/kg). Per meal = daily ÷ meals. Whey scoops = daily ÷ 25g.", limitations: "Limitations", limitationsText: "Factors are population averages; kidney disease, pregnancy, elderly, and special diets need individual adjustment. Prioritize whole foods; use supplements only for the gap.", interpretation: "Interpretation", interpretationText: "1.6–2.2 g/kg is safe and effective for most exercisers; ~20–40g per meal absorbs best; excess does not build extra muscle.", context: "Context", contextText: "Protein planning should be viewed with TDEE, Macro, and training volume: set the daily total first, then plan meals and sources.", example: "Example", exampleText: "Weight 70kg, moderate 1.6 → 112g daily, split into 4 meals of 28g each, about 4.5 whey scoops.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next supplements for protein planning", premiumTitle: "PRO Protein Tracking Pack", premiumText: "Unlock meal-by-meal scheduling, a food protein database, weekly adherence tracking, and personalized plate reports.", feat1: "Meals", feat2: "Database", feat3: "Adherence", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool estimates daily protein as body weight × an activity factor, aligned with RDA and sports-nutrition consensus. For education and planning only; it does not replace professional advice.", relatedTools: "Related Tools", relatedToolsText: "TDEE Calculator · Macro Calculator · Body Fat Calculator · Workout Plan Calculator", references: "References", referencesText: "ISSN protein & exercise position stand; US Dietary Reference Intakes (DRI); Phillips protein requirements review.",
    q1: "How much protein per day?", a1: "It depends on goal: sedentary ≈0.8, regular exercise 1.2–1.6, muscle-building or muscle-sparing cuts 1.6–2.2 g/kg bodyweight. This tool estimates from your choice.",
    q2: "Should I split protein across meals?", a2: "Yes—3–5 meals of ≈20–40g each sustains muscle protein synthesis better than one large dose.",
    q3: "What are quality sources?", a3: "Eggs, dairy, lean meat, fish, soy, and whey are high biological value; combine varied plant sources to complete amino acids.",
    q4: "Does high protein harm kidneys?", a4: "Generally safe for healthy kidneys; those with kidney disease should follow medical guidance on limits and stay well hydrated.",
    q5: "Are supplements necessary?", a5: "No. Get protein from whole foods first; use powder only to top up the remaining gap—convenient and cost-effective.",
    q6: "Can this be a medical or nutrition prescription?", a6: "No. It is an educational estimate; for disease, pregnancy, medication, or special conditions, consult a doctor or dietitian.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ProteinCalculator() {
  const { lang, setLang } = useLanguage();
  const [weight, setWeight] = useState("70");
  const [meals, setMeals] = useState("4");
  const [goal, setGoal] = useState<Goal>("moderate");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Math.max(0, Number(weight) || 0);
    const m = Math.max(1, Math.min(8, Number(meals) || 0));
    if (w <= 0) return null;
    const factor = goalFactor[goal];
    const daily = w * factor;
    const perMeal = daily / m;
    const scoops = daily / 25;
    return { w, m, factor, daily, perMeal, scoops };
  }, [weight, meals, goal]);

  const dailyDisplay = result ? fmt(result.daily, 0) : "—";
  const perMealDisplay = result ? fmt(result.perMeal, 0) : "—";
  const scoopsDisplay = result ? fmt(result.scoops, 1) : "—";

  function fillStandard() { setWeight("70"); setMeals("4"); setGoal("moderate"); }
  function fillCut() { setWeight("70"); setMeals("5"); setGoal("strength"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{dailyDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{goal === "strength" || goal === "athlete" ? "💪" : goal === "sedentary" ? "🪑" : "🍗"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weight}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{meals}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${goal === "moderate" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setGoal("moderate")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${goal === "strength" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setGoal("strength")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">112g</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExample}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">140g</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExample}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" type="number" min={1} max={8} value={meals} onChange={(e) => setMeals(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}><option value="sedentary">{lang === "zh" ? "久坐" : "Sedentary"}</option><option value="light">{lang === "zh" ? "輕度活動" : "Lightly active"}</option><option value="moderate">{t.goalCut}</option><option value="strength">{t.goalMaintain}</option><option value="athlete">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{dailyDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight} kg</div><div className="mt-1 text-xs text-slate-300">{result ? `${result.factor} g/kg` : "—"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{perMealDisplay}</p><p className="text-sm font-bold text-blue-700">g</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{scoopsDisplay}</p><p className="text-sm font-bold text-emerald-700">×</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">MEALS</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.flowDemo}</div><p className="mt-2 text-3xl font-black text-orange-950">{meals}</p><p className="text-sm font-bold text-orange-700">/day</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-ResultIntelligence */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => { const active = result ? (bands.find((b) => result.daily <= b.max) ?? bands[bands.length - 1]).key === item.key : false; return <div key={item.key} className={`rounded-2xl border p-4 ${active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{dailyDisplay} <span className="text-sm text-slate-500">g</span></p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="protein-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison + L9 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.dailyLabel}</div><div className="mt-1 text-3xl font-black">{dailyDisplay}g</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{perMealDisplay}g</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{scoopsDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Weight", note: t.bmrStep }, { label: "Protein", note: t.deficitStep }, { label: "Per meal", note: t.trendStep }, { label: "Tracking", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="protein-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L15-Affiliate */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer sponsored" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO">{/* L16-PremiumGate */}<article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
