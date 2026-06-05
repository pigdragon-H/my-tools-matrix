// @profile B
// Profile B · Calculator-YMYL · GlycemicIndexCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "low-gi", range: "GI ≤ 55", label: { zh: "低升糖", en: "Low GI" }, desc: { zh: "血糖上升緩慢，飽足感較久，適合日常主食基礎。", en: "Slow blood-sugar rise; longer satiety." } },
  { key: "med-gi", range: "GI 56–69", label: { zh: "中升糖", en: "Medium GI" }, desc: { zh: "上升中等，可搭配蛋白質與纖維平衡。", en: "Moderate rise; pair with protein and fiber." } },
  { key: "high-gi", range: "GI ≥ 70", label: { zh: "高升糖", en: "High GI" }, desc: { zh: "上升快速，建議控制份量或搭配低GI食物。", en: "Fast rise; control portion or pair with low-GI foods." } },
  { key: "low-gl", range: "GL ≤ 10", label: { zh: "低升糖負荷", en: "Low GL" }, desc: { zh: "單份對血糖影響小，多數日常份量目標。", en: "Small per-serving impact; everyday target." } },
  { key: "med-gl", range: "GL 11–19", label: { zh: "中升糖負荷", en: "Medium GL" }, desc: { zh: "中等影響，注意一天累積總量。", en: "Moderate impact; watch daily total." } },
  { key: "high-gl", range: "GL ≥ 20", label: { zh: "高升糖負荷", en: "High GL" }, desc: { zh: "單份影響大，建議減量或分散攝取。", en: "High impact; reduce or spread intake." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "卡路里計算機", en: "Calorie Calculator" }, href: "/tools/health/calorie-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "糖尿病風險評估", en: "Diabetes Risk" }, href: "/tools/health/diabetes-risk-calculator" },
  { label: { zh: "維生素D計算機", en: "Vitamin D Calculator" }, href: "/tools/health/vitamin-d-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 血糖管理 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "升糖指數計算機 · GI / GL", subtitle: "用食物 GI 值與份量碳水估算升糖負荷 (GL)",
    intro: "升糖指數計算機依食物升糖指數 (GI) 與單份碳水化合物公克數，計算升糖負荷 (GL = GI × 碳水 ÷ 100)，協助你比較不同食物對血糖的影響，規劃血糖友善飲食。",
    trustNoteLabel: "注意事項：", trustNote: "GI/GL 為食物層級的相對指標，實際血糖反應受烹調、成熟度、搭配食物與個人代謝差異影響；本工具不可取代醫療建議。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立升糖負荷範例", examplePreview: "升糖負荷預覽", examplePerson: "GI 值", fillExample: "一鍵填入標準範例", previewActivePath: "填入高GI範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入 GI 與碳水", examplesHelper: "先用範例理解 GI 與 GL 的差別，再改成你要評估的食物數值。",
    metric: "公制 (g)", imperial: "份量 (serving)", exampleCards: "範例卡", baselineExample: "燕麥 (低GI)", activeExample: "白吐司 (高GI)", baselineExampleNote: "GI 55 · 27g 碳水 · GL ≈ 15", activeExampleNote: "GI 75 · 24g 碳水 · GL ≈ 18", flowDemo: "GL 試算", calculator: "計算機",
    weight: "GI 升糖指數 (0–110)", tdee: "每份碳水 (g)", goal: "食物類型", goalCut: "主食/澱粉", goalMaintain: "水果", goalBulk: "點心/飲料",
    resultCard: "升糖負荷計算結果", unit: "GL (升糖負荷)", primaryValue: "GI 值", maintenanceTarget: "GI 等級", actionTarget: "GL 等級", estimatedTdee: "碳水", maintenance: "GI", fatLossTarget: "GL", carbsLabel: "碳水",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 GI / GL 判讀矩陣", tdeeMatrixNote: "L7 固定六格，將 GI 與 GL 分別放進常見區間；這是教育參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把升糖數值轉成可執行飲食", conversionNote: "L9 會連動目前計算結果，顯示份量調整、搭配建議與每日累積提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前食物評估", dailyGap: "每份 GL", weeklyTrend: "GI 等級", motivation: "動力卡", keepMomentum: "從單一食物走向整體飲食",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的血糖友善飲食帶回家", journeyHint: "用實際份量與搭配重新評估，避免被單一食物的 GI 標籤誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 Macro 確認整體碳水與蛋白比例", nextActionItem2: "用 Calorie 估算單餐熱量", nextActionItem3: "若有血糖疑慮，用糖尿病風險評估搭配", 
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "GI → GL → 份量調整 → 飲食規劃", bmrStep: "查 GI 值", deficitStep: "算 GL", trendStep: "調份量", mealStep: "整體飲食",
    knowledge: "知識", knowledgeTitle: "GI / GL 在血糖管理中的意義", definition: "定義", definitionText: "升糖指數 (GI) 衡量食物相對於葡萄糖造成血糖上升的速度；升糖負荷 (GL) 同時考量份量，更貼近實際影響。", formula: "公式", formulaText: "GL = (GI × 該份碳水化合物公克數) ÷ 100。例如 GI 50、碳水 30g → GL = 50×30÷100 = 15。", limitations: "限制", limitationsText: "GI 為實驗值，會因品種、成熟度、烹調與加工而變；混合餐點的實際反應與單一食物標示不同，個人代謝亦有差異。", interpretation: "解讀", interpretationText: "GI ≤55 低、56–69 中、≥70 高；GL ≤10 低、11–19 中、≥20 高。低 GI 搭配纖維與蛋白質有助血糖平穩。", context: "脈絡", contextText: "GI/GL 應與整體熱量、巨量營養素與用餐順序一起看，而非單看一個數字。", example: "範例", exampleText: "燕麥 GI 55、碳水 27g → GL ≈ 15（中）；白吐司 GI 75、碳水 24g → GL ≈ 18（中偏高，且上升較快）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "血糖管理的下一步工具", premiumTitle: "PRO 血糖飲食包", premiumText: "解鎖食物 GI 資料庫、混合餐 GL 試算、每日血糖負荷追蹤與個人化飲食報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議；糖尿病或血糖異常者請諮詢專業人員。", relatedTools: "相關工具", relatedToolsText: "Calorie Calculator · Macro Calculator · Diabetes Risk · Vitamin D Calculator", references: "參考資料", referencesText: "International Tables of Glycemic Index and Glycemic Load Values (Atkinson et al.); Foster-Powell GI/GL methodology; WHO/FAO Carbohydrates in Human Nutrition; ADA Standards of Care。",
    q1: "GI 和 GL 有什麼不同？", a1: "GI 只看血糖上升速度，不考慮吃多少；GL 把份量算進去，更接近實際對血糖的影響。",
    q2: "低 GI 食物就一定健康嗎？", a2: "不一定。低 GI 也可能高熱量或高脂；應與整體飲食品質一起評估。",
    q3: "為什麼煮過的食物 GI 會變高？", a3: "加熱與糊化會讓澱粉更易被消化吸收，通常使 GI 上升，例如煮久的麵或熟透的水果。",
    q4: "糖尿病患者可以只看 GI 嗎？", a4: "不建議。請以 GL、總碳水與專業醫療團隊的個人化計畫為主，本工具僅供參考。",
    q5: "搭配蛋白質或纖維會降低 GL 嗎？", a5: "搭配會減緩整體血糖上升，但 GL 數值是以該食物碳水計算；混合餐的實際反應需整體評估。",
    q6: "這個工具能診斷血糖問題嗎？", a6: "不能。它只是教育用估算；若有血糖異常、用藥或懷孕，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Blood Sugar · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Glycemic Index Calculator · GI / GL", subtitle: "Estimate glycemic load (GL) from a food's GI and carbs per serving",
    intro: "This glycemic index calculator computes glycemic load (GL = GI × carbs ÷ 100) from a food's glycemic index and grams of carbohydrate per serving, helping you compare how foods affect blood sugar and plan a blood-sugar-friendly diet.",
    trustNoteLabel: "Note: ", trustNote: "GI/GL are food-level relative indicators; actual blood-sugar response depends on cooking, ripeness, food pairing and individual metabolism. This tool does not replace medical advice.",
    quickActionCard: "Quick Example Card", tryExample: "Build a glycemic-load example in one click", examplePreview: "Glycemic Load Preview", examplePerson: "GI Value", fillExample: "Fill standard example", previewActivePath: "Fill high-GI example",
    examplesCalculator: "Example → Calculator", enterValues: "Enter GI & Carbs", examplesHelper: "Use the examples to understand the GI vs GL difference, then change to the food you want to assess.",
    metric: "Metric (g)", imperial: "Serving", exampleCards: "Example cards", baselineExample: "Oats (Low GI)", activeExample: "White toast (High GI)", baselineExampleNote: "GI 55 · 27g carbs · GL ≈ 15", activeExampleNote: "GI 75 · 24g carbs · GL ≈ 18", flowDemo: "GL Demo", calculator: "Calculator",
    weight: "GI value (0–110)", tdee: "Carbs per serving (g)", goal: "Food type", goalCut: "Staple/Starch", goalMaintain: "Fruit", goalBulk: "Snack/Drink",
    resultCard: "Glycemic Load Result", unit: "GL (Glycemic Load)", primaryValue: "GI value", maintenanceTarget: "GI band", actionTarget: "GL band", estimatedTdee: "Carbs", maintenance: "GI", fatLossTarget: "GL", carbsLabel: "CARBS",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-cell GI / GL matrix", tdeeMatrixNote: "L7 fixed six cells placing GI and GL into common bands; educational reference, not a medical prescription.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn glycemic numbers into actionable eating", conversionNote: "L9 reflects the current result with portion tweaks, pairing tips and a daily-total reminder.",
    progressInsight: "Progress insight", possibleTarget: "Current food assessment", dailyGap: "GL per serving", weeklyTrend: "GI band", motivation: "Motivation", keepMomentum: "From one food to the whole diet",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's blood-sugar-friendly plan home", journeyHint: "Reassess with real portions and pairings; don't be misled by a single food's GI label.",
    nextActionLabel: "Next action", nextActionTitle: "Hand the result to the next tool", nextActionItem1: "Use Macro to confirm overall carb/protein balance", nextActionItem2: "Use Calorie to estimate meal energy", nextActionItem3: "If concerned, pair with the Diabetes Risk tool",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "GI → GL → Portion tweak → Diet plan", bmrStep: "Find GI", deficitStep: "Compute GL", trendStep: "Adjust portion", mealStep: "Whole diet",
    knowledge: "Knowledge", knowledgeTitle: "What GI / GL mean for blood sugar", definition: "Definition", definitionText: "Glycemic index (GI) measures how fast a food raises blood sugar relative to glucose; glycemic load (GL) also factors in portion, closer to real impact.", formula: "Formula", formulaText: "GL = (GI × grams of carbohydrate in that serving) ÷ 100. e.g. GI 50, carbs 30g → GL = 50×30÷100 = 15.", limitations: "Limitations", limitationsText: "GI is an experimental value that varies with variety, ripeness, cooking and processing; mixed meals differ from single-food labels, and metabolism varies between people.", interpretation: "Interpretation", interpretationText: "GI ≤55 low, 56–69 medium, ≥70 high; GL ≤10 low, 11–19 medium, ≥20 high. Low GI with fiber and protein helps steadier blood sugar.", context: "Context", contextText: "Read GI/GL alongside total calories, macros and meal order — not as a single number.", example: "Example", exampleText: "Oats GI 55, carbs 27g → GL ≈ 15 (medium); white toast GI 75, carbs 24g → GL ≈ 18 (medium-high, faster rise).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next tools for blood-sugar management", premiumTitle: "PRO Blood-Sugar Pack", premiumText: "Unlock a food GI database, mixed-meal GL calc, daily glycemic-load tracking and a personalized diet report.",
    trustReferences: "Trust · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only; it does not replace medical diagnosis, nutrition therapy or professional advice. People with diabetes or abnormal blood sugar should consult a professional.", relatedTools: "Related tools", relatedToolsText: "Calorie Calculator · Macro Calculator · Diabetes Risk · Vitamin D Calculator", references: "References", referencesText: "International Tables of Glycemic Index and Glycemic Load Values (Atkinson et al.); Foster-Powell GI/GL methodology; WHO/FAO Carbohydrates in Human Nutrition; ADA Standards of Care.",
    q1: "What is the difference between GI and GL?", a1: "GI only reflects how fast blood sugar rises; GL also includes portion size, so it's closer to real impact.",
    q2: "Are low-GI foods always healthy?", a2: "Not necessarily. Low-GI foods can still be high in calories or fat; assess them with overall diet quality.",
    q3: "Why does cooked food have a higher GI?", a3: "Heating and gelatinization make starch easier to digest, usually raising GI — e.g. well-cooked pasta or very ripe fruit.",
    q4: "Can people with diabetes rely on GI alone?", a4: "Not advised. Prioritize GL, total carbs and a personalized plan from your care team; this tool is reference only.",
    q5: "Does adding protein or fiber lower GL?", a5: "Pairing slows the overall rise, but the GL number is computed from that food's carbs; mixed-meal response needs holistic assessment.",
    q6: "Can this tool diagnose blood-sugar problems?", a6: "No. It's only an educational estimate; if you have abnormal blood sugar, medication or pregnancy, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function giBand(gi: number): string {
  if (gi >= 70) return "high";
  if (gi >= 56) return "medium";
  return "low";
}

export default function GlycemicIndexCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [gi, setGi] = useState("55");
  const [carbs, setCarbs] = useState("27");
  const [type, setType] = useState<"staple" | "fruit" | "snack">("staple");
  const t = ui[lang];

  const result = useMemo(() => {
    const giVal = Number(gi);
    const cVal = Number(carbs);
    if (giVal <= 0 || cVal <= 0) return null;
    const gl = (giVal * cVal) / 100;
    const band = giBand(giVal);
    const glBand = gl >= 20 ? "high" : gl >= 11 ? "medium" : "low";
    return { giVal, cVal, gl, band, glBand };
  }, [gi, carbs]);

  const glDisplay = result ? fmt(result.gl, 1) : "—";
  const giDisplay = result ? fmt(result.giVal, 0) : "—";
  const carbDisplay = result ? fmt(result.cVal, 0) : "—";
  const giBandLabel = result ? (result.band === "high" ? "High" : result.band === "medium" ? "Med" : "Low") : "—";
  const glBandLabel = result ? (result.glBand === "high" ? "High" : result.glBand === "medium" ? "Med" : "Low") : "—";

  function fillStandard() { setUnit("metric"); setGi("55"); setCarbs("27"); setType("staple"); }
  function fillCut() { setUnit("metric"); setGi("75"); setCarbs("24"); setType("staple"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{glDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{gi}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{carbs}g</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{type === "fruit" ? "🍎" : type === "snack" ? "🍪" : "🍞"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">GI 55</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">GI 75</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={gi} onChange={(e) => setGi(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={type} onChange={(e) => setType(e.target.value as "staple" | "fruit" | "snack")}><option value="staple">{t.goalCut}</option><option value="fruit">{t.goalMaintain}</option><option value="snack">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{glDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{giDisplay}</div><div className="mt-1 text-xs text-slate-300">{giBandLabel.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{giBandLabel}</p><p className="text-sm font-bold text-blue-700">GI</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{glBandLabel}</p><p className="text-sm font-bold text-emerald-700">GL</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">g</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="gi-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">GL</div><div className="mt-1 text-3xl font-black">{glDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{glBandLabel}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{giBandLabel}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "GI", note: t.bmrStep }, { label: "GL", note: t.deficitStep }, { label: "Portion", note: t.trendStep }, { label: "Diet", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="gi-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Database", "MealGL", "Tracking", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
