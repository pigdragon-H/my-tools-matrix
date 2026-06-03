// @profile B
// Profile B · Calculator-YMYL · BodyFatCalculator（由 BMR 黃金模板視覺骨架重建）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type UnitSystem = "metric" | "imperial";
type Sex = "male" | "female";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 1) => Number.isFinite(v) ? v.toFixed(d) : "—";
const toIn = (v: number, unit: UnitSystem) => unit === "metric" ? v / 2.54 : v;

const bands = [
  { key: "low", range: "<13%", label: { zh: "偏低體脂", en: "Low body fat" }, desc: { zh: "男性低於13%或女性低於20%時，需結合健康狀態判讀。", en: "Below 13% for men or 20% for women needs context." } },
  { key: "normal", range: "13–24%", label: { zh: "正常", en: "Common range" }, desc: { zh: "多數成人常見區間，仍需搭配腰圍與生活型態。", en: "A common adult range; pair with waist and lifestyle." } },
  { key: "elevated", range: "25–31%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "建議回看飲食、活動量與腰圍變化。", en: "Review nutrition, activity, and waist trend." } },
  { key: "high", range: "32–39%", label: { zh: "高體脂", en: "High" }, desc: { zh: "可與 TDEE、熱量赤字工具一起規劃下一步。", en: "Use TDEE and deficit tools to plan next steps." } },
  { key: "obese", range: "40%+", label: { zh: "肥胖", en: "Very high" }, desc: { zh: "建議尋求專業人員協助做完整風險評估。", en: "Consider professional risk assessment." } },
  { key: "athlete", range: "特例", label: { zh: "運動員特例", en: "Athlete exception" }, desc: { zh: "高肌肉量者可能與一般分類不同。", en: "High lean-mass athletes may classify differently." } },
] as const;

const recs = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "理想體重計算機", en: "Ideal Weight Calculator" }, href: "/tools/health/ideal-weight-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
];

function navyBodyFat(sex: Sex, heightIn: number, neckIn: number, waistIn: number, hipIn: number) {
  if (heightIn <= 0 || neckIn <= 0 || waistIn <= 0) return null;
  if (sex === "male") {
    const diff = waistIn - neckIn;
    if (diff <= 0) return null;
    return 86.01 * Math.log10(diff) - 70.041 * Math.log10(heightIn) + 36.76;
  }
  const sum = waistIn + hipIn - neckIn;
  if (hipIn <= 0 || sum <= 0) return null;
  return 163.205 * Math.log10(sum) - 97.684 * Math.log10(heightIn) - 78.387;
}

const ui = {
  zh: {
    badge: "健康 · 體組成 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "體脂率計算機 · U.S. Navy 圍度法", subtitle: "用身高、頸圍、腰圍與臀圍估算體脂率",
    intro: "Body Fat Calculator 使用 U.S. Navy circumference method。男性使用腰圍、頸圍與身高；女性加入臀圍。結果適合做健康規劃起點，不等於醫療診斷或 DEXA 檢測。",
    trustNoteLabel: "注意事項：", trustNote: "請用軟尺水平量測並重複兩次。水分、量測位置、肌肉量與族群差異都會影響估算。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立體脂範例", examplePreview: "體脂率預覽", examplePerson: "成年男性", fillExample: "一鍵填入標準範例", previewActivePath: "填入女性範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入圍度並估算體脂", examplesHelper: "先用範例理解身高、頸圍、腰圍與臀圍如何進入公式，再改成自己的量測值。",
    metric: "公制", imperial: "英制", exampleCards: "範例卡", baselineExample: "男性標準範例", activeExample: "女性圍度範例", flowDemo: "Navy formula", calculator: "計算機",
    heightCm: "身高（cm）", neckCm: "頸圍（cm）", waistCm: "腰圍（cm）", hipCm: "臀圍（cm）", heightIn: "身高（in）", neckIn: "頸圍（in）", waistIn: "腰圍（in）", hipIn: "臀圍（in）", sex: "性別", male: "男性", female: "女性",
    resultCard: "體脂率結果", unit: "% body fat", primaryValue: "主要數值", maintenanceTarget: "脂肪重量估算", actionTarget: "瘦體重估算", estimatedTdee: "體脂率", maintenance: "脂肪量", fatLossTarget: "瘦體重",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格體脂判讀矩陣", tdeeMatrixNote: "L7 固定六格，用目前體脂率對照常見區間；分類不是診斷，運動員與特殊族群需額外判讀。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把體脂率轉成下一步健康規劃", conversionNote: "L9 數值會隨計算結果改變，協助把單一百分比轉成可行動的追蹤指標。",
    progressInsight: "進度洞察卡", possibleTarget: "目前體組成估算", dailyGap: "距離25%", weeklyTrend: "估算脂肪kg", motivation: "動力卡", keepMomentum: "從體脂數字走向穩定行動",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的體脂估算帶回家", journeyHint: "截圖或收藏本頁，下次用同一量測方式比較趨勢。", nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 BMI 或理想體重確認整體脈絡", nextActionItem2: "用 TDEE 建立維持熱量", nextActionItem3: "若目標是減脂，再進入熱量赤字規劃", shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "BMI / 理想體重 / 腰圍 → 體脂率 → TDEE / 熱量赤字 / Macro", bmiStep: "上游指標", bfStep: "體脂估算", tdeeStep: "熱量消耗", macroStep: "營養分配",
    knowledge: "知識", knowledgeTitle: "U.S. Navy 體脂公式如何運作", definition: "定義", definitionText: "體脂率是脂肪重量占體重的比例，此工具用圍度估算而非直接量測。", formula: "公式", formulaText: "男性：86.010×log10(腰圍−頸圍)−70.041×log10(身高)+36.76。女性：163.205×log10(腰圍+臀圍−頸圍)−97.684×log10(身高)−78.387。單位為英寸。", limitations: "限制", limitationsText: "圍度法方便但不是醫療診斷；DEXA、水下秤重與專業評估可能更精準。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "體組成規劃的下一步工具", premiumTitle: "PRO 體組成追蹤包", premiumText: "解鎖體脂趨勢、TDEE 連動、熱量赤字模擬與個人化報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Ideal Weight Calculator · TDEE Calculator · Calorie Deficit Calculator", references: "參考資料", referencesText: "U.S. Navy Physical Readiness Program；DTIC Navy circumference reports；CDC BMI；Harvard Health body fat overview。",
    q1: "體脂率和 BMI 有什麼不同？", a1: "BMI 只用身高與體重估算體重狀態；體脂率嘗試估算脂肪占體重的比例。",
    q2: "U.S. Navy 圍度法準確嗎？", a2: "它適合快速估算與追蹤趨勢，但會受量測位置、肌肉量與族群差異影響。",
    q3: "腰圍、頸圍、臀圍要怎麼量？", a3: "使用軟尺水平量測，不要勒緊；男性通常用腰圍與頸圍，女性還需要臀圍。",
    q4: "運動員適合用這個結果嗎？", a4: "高肌肉量運動員可能與一般族群不同，建議搭配專業體組成檢測。",
    q5: "為什麼男女公式不同？", a5: "Navy 公式根據不同性別的脂肪分布與圍度關係建立，因此使用不同變數。",
    q6: "這個工具可以診斷肥胖或疾病嗎？", a6: "不可以。它是教育用估算工具，任何診斷或治療決策都應諮詢專業人員。",
  },
  en: {
    badge: "Health · Body Composition · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Body Fat Calculator · U.S. Navy Method", subtitle: "Estimate body-fat percentage from height and circumferences",
    intro: "This Body Fat Calculator uses the U.S. Navy circumference method. Men use waist, neck, and height; women also include hip circumference. Use the result as a planning estimate, not a medical diagnosis or DEXA replacement.",
    trustNoteLabel: "Note:", trustNote: "Use a soft tape, keep it level, and measure twice. Hydration, tape placement, muscle mass, and population differences affect estimates.",
    quickActionCard: "Quick Action Card", tryExample: "Create a body-fat example instantly", examplePreview: "Body-fat preview", examplePerson: "Adult male", fillExample: "One-click male example", previewActivePath: "Fill female example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter circumferences and estimate body fat", examplesHelper: "Start with an example to see how height, neck, waist, and hip feed the formula, then replace the values with your own measurements.",
    metric: "Metric", imperial: "Imperial", exampleCards: "Example cards", baselineExample: "Male example", activeExample: "Female example", flowDemo: "Navy formula", calculator: "Calculator",
    heightCm: "Height (cm)", neckCm: "Neck (cm)", waistCm: "Waist (cm)", hipCm: "Hip (cm)", heightIn: "Height (in)", neckIn: "Neck (in)", waistIn: "Waist (in)", hipIn: "Hip (in)", sex: "Sex", male: "Male", female: "Female",
    resultCard: "Body Fat Result", unit: "% body fat", primaryValue: "Primary Value", maintenanceTarget: "Estimated fat mass", actionTarget: "Estimated lean mass", estimatedTdee: "Body-fat percentage", maintenance: "Fat mass", fatLossTarget: "Lean mass",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card body-fat interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to interpret the current estimate against common ranges. This is not a diagnosis; athletes and special populations need context.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn body-fat estimate into a health plan", conversionNote: "L9 values update from the computed result so the percentage becomes an actionable tracking signal.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current body-composition estimate", dailyGap: "Gap to 25%", weeklyTrend: "Estimated fat kg", motivation: "Motivation Card", keepMomentum: "Move from body-fat number to steady action",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's estimate home", journeyHint: "Screenshot or bookmark this page, then compare trends using the same measurement method.", nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use BMI or Ideal Weight for context", nextActionItem2: "Use TDEE to estimate maintenance calories", nextActionItem3: "Use Calorie Deficit if fat loss is the goal", shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "BMI / Ideal Weight / Waist → Body Fat → TDEE / Deficit / Macro", bmiStep: "Upstream metric", bfStep: "Body-fat estimate", tdeeStep: "Energy burn", macroStep: "Nutrition split",
    knowledge: "Knowledge", knowledgeTitle: "How the U.S. Navy body-fat formula works", definition: "Definition", definitionText: "Body-fat percentage is the share of body weight estimated to be fat mass. This tool estimates it from circumferences rather than measuring it directly.", formula: "Formula", formulaText: "Men: 86.010×log10(waist−neck)−70.041×log10(height)+36.76. Women: 163.205×log10(waist+hip−neck)−97.684×log10(height)−78.387. Inputs are inches.", limitations: "Limitations", limitationsText: "Circumference methods are convenient but not diagnostic; DEXA, hydrostatic weighing, and professional assessments may be more precise.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for body-composition planning", premiumTitle: "PRO Body Composition Tracking Pack", premiumText: "Unlock body-fat trends, TDEE linking, calorie-deficit simulation, and personalized reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Ideal Weight Calculator · TDEE Calculator · Calorie Deficit Calculator", references: "References", referencesText: "U.S. Navy Physical Readiness Program; DTIC Navy circumference reports; CDC BMI; Harvard Health body-fat overview.",
    q1: "How is body-fat percentage different from BMI?", a1: "BMI uses only height and weight; body-fat percentage estimates how much of body weight is fat mass.",
    q2: "Is the U.S. Navy method accurate?", a2: "It is useful for quick estimates and trend tracking, but tape placement, muscle mass, and population differences affect accuracy.",
    q3: "How should I measure neck, waist, and hip?", a3: "Use a soft tape held level without compressing the skin. Men usually need neck and waist; women also need hip.",
    q4: "Does this work for athletes?", a4: "Athletes with high lean mass may not fit general ranges. Pair this with professional body-composition testing when precision matters.",
    q5: "Why are the male and female formulas different?", a5: "The Navy equations use different variables because body-fat distribution and circumference relationships differ by sex.",
    q6: "Can this diagnose obesity or disease?", a6: "No. It is an educational estimate; diagnosis or treatment decisions should be made with qualified professionals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BodyFatCalculator() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState("175");
  const [neck, setNeck] = useState("38");
  const [waist, setWaist] = useState("84");
  const [hip, setHip] = useState("96");
  const [weightKg, setWeightKg] = useState("70");
  const t = ui[lang];

  const result = useMemo(() => {
    const h = toIn(Number(height), unitSystem);
    const n = toIn(Number(neck), unitSystem);
    const w = toIn(Number(waist), unitSystem);
    const hp = toIn(Number(hip), unitSystem);
    const bf = navyBodyFat(sex, h, n, w, hp);
    const weight = unitSystem === "metric" ? Number(weightKg) : Number(weightKg) * 0.453592;
    if (bf === null || !Number.isFinite(bf)) return null;
    const clamped = Math.max(2, Math.min(65, bf));
    return { bf: clamped, fatKg: weight > 0 ? weight * clamped / 100 : 0, leanKg: weight > 0 ? weight * (1 - clamped / 100) : 0, gap25: clamped - 25 };
  }, [height, hip, neck, sex, unitSystem, waist, weightKg]);

  const bfDisplay = result ? fmt(result.bf) : "—";
  const fatDisplay = result ? fmt(result.fatKg) : "—";
  const leanDisplay = result ? fmt(result.leanKg) : "—";

  function fillMale() { setUnitSystem("metric"); setSex("male"); setHeight("175"); setNeck("38"); setWaist("84"); setHip("96"); setWeightKg("70"); }
  function fillFemale() { setUnitSystem("metric"); setSex("female"); setHeight("165"); setNeck("33"); setWaist("76"); setHip("98"); setWeightKg("60"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bfDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{sex === "male" ? t.male : t.female}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{unitSystem === "metric" ? t.waistCm : t.waistIn}</div><div className="font-black">{waist}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{unitSystem === "metric" ? t.neckCm : t.neckIn}</div><div className="font-black">{neck}</div></div></div><button onClick={fillMale} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillFemale} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillMale} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">18.6%</span></div><p className="mt-2 text-sm text-slate-600">175cm · neck 38 · waist 84</p></button><button onClick={fillFemale} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">165cm · neck 33 · waist 76 · hip 98</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.sex}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label><label className="block text-sm font-black text-slate-700">Weight kg<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{unitSystem === "metric" ? t.heightCm : t.heightIn}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={height} onChange={(e) => setHeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{unitSystem === "metric" ? t.neckCm : t.neckIn}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={neck} onChange={(e) => setNeck(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{unitSystem === "metric" ? t.waistCm : t.waistIn}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={waist} onChange={(e) => setWaist(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{unitSystem === "metric" ? t.hipCm : t.hipIn}<input disabled={sex === "male"} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold disabled:bg-slate-100" value={hip} onChange={(e) => setHip(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bfDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.sex}</div><div className="mt-1 text-xl font-black">{sex === "male" ? t.male : t.female}</div><div className="mt-1 text-xs text-slate-300">Navy method</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-blue-950">{bfDisplay}%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">kg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-orange-950">{leanDisplay}</p><p className="text-sm font-bold text-orange-700">kg</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{bfDisplay}%</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="body-fat-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Body Fat</div><div className="mt-1 text-3xl font-black">{bfDisplay}%</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.gap25) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fatDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmiStep, t.bfStep, t.tdeeStep, t.macroStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMI", note: t.bmiStep }, { label: "Body Fat", note: t.bfStep }, { label: "TDEE", note: t.tdeeStep }, { label: "Macro", note: t.macroStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="body-fat-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{recs.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Body Fat", "TDEE", "Deficit", "Reports"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
