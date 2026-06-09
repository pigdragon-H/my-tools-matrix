// @profile B
// Profile B · Calculator-YMYL · VitaminDCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Sun = "low" | "moderate" | "high";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const TARGET_NG = 40; // mid of 30-50 ng/mL sufficient band
const IU_PER_NG = 100; // ~100 IU/day raises serum ~1 ng/mL at steady state
const sunFactor: Record<Sun, number> = { low: 1.15, moderate: 1.0, high: 0.8 };

const bands = [
  { key: "deficient", range: "< 20 ng/mL", label: { zh: "缺乏", en: "Deficient" }, desc: { zh: "血清濃度偏低，骨骼與免疫功能可能受影響，建議補充並複檢。", en: "Low serum level; bone and immune function may be affected. Supplement and retest." } },
  { key: "insufficient", range: "20–30 ng/mL", label: { zh: "不足", en: "Insufficient" }, desc: { zh: "略低於理想，建議增加日照或補充劑。", en: "Slightly below ideal; increase sun exposure or supplementation." } },
  { key: "sufficient", range: "30–50 ng/mL", label: { zh: "充足", en: "Sufficient" }, desc: { zh: "多數人理想範圍，維持目前攝取即可。", en: "Ideal range for most; maintain current intake." } },
  { key: "high", range: "50–80 ng/mL", label: { zh: "偏高", en: "High" }, desc: { zh: "高於一般需求，無須額外大劑量補充。", en: "Above typical needs; no extra high-dose supplementation needed." } },
  { key: "veryhigh", range: "80–100 ng/mL", label: { zh: "很高", en: "Very high" }, desc: { zh: "接近上限，應檢視補充劑量。", en: "Near upper limit; review supplement dosing." } },
  { key: "excess", range: "> 100 ng/mL", label: { zh: "過量", en: "Excessive" }, desc: { zh: "可能有中毒風險，應停止高劑量並諮詢醫師。", en: "Potential toxicity risk; stop high doses and consult a doctor." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "水分攝取計算機", en: "Water Intake Calculator" }, href: "/tools/health/water-intake-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "生理年齡計算機", en: "Biological Age Calculator" }, href: "/tools/health/biological-age-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 營養補充 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "維生素D計算機 · Vitamin D Planner", subtitle: "用目前血清濃度、年齡與日照習慣估算每日建議攝取量",
    intro: "Vitamin D Calculator 依據目前血清 25(OH)D 濃度(ng/mL)、目標濃度與日照習慣，估算每日建議補充的維生素D(IU)，幫您把血清濃度從現值提升到充足區間(30–50 ng/mL)。",
    trustNoteLabel: "注意事項：", trustNote: "本估算採用「約 100 IU/日提升血清約 1 ng/mL」的群體均值；個人吸收率、體重、腎肝功能與用藥會影響實際需求，補充前請諮詢醫師並驗血。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立維生素D範例", examplePreview: "每日建議預覽", examplePerson: "目前濃度", fillExample: "一鍵填入標準範例", previewActivePath: "填入低日照範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入目前濃度、年齡與日照", examplesHelper: "先用範例理解血清濃度與建議攝取的關係，再改成您自己的驗血數據。",
    metric: "ng/mL (美制)", imperial: "nmol/L (歐制)", exampleCards: "範例卡", baselineExample: "成人 缺乏補充", activeExample: "長者 低日照示範", gapLabel: "缺口", baselineExampleNote: "18 ng/mL · 35 歲 · 中等日照", activeExampleNote: "12 ng/mL · 72 歲 · 低日照", flowDemo: "目標 40", calculator: "計算機",
    weight: "目前血清 25(OH)D (ng/mL)", tdee: "年齡 (歲)", goal: "日照習慣", goalCut: "低日照", goalMaintain: "中等", goalBulk: "高日照",
    resultCard: "維生素D建議結果", unit: "IU/day", primaryValue: "目標濃度", maintenanceTarget: "需提升 (ng/mL)", actionTarget: "維持劑量 (IU)", estimatedTdee: "目標濃度", maintenance: "差距", fatLossTarget: "維持",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格血清濃度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前血清濃度放進常見判讀區間；這是規劃參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把維生素D建議換成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每日劑量、達標週數與複檢提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前補充規劃", dailyGap: "每日劑量", weeklyTrend: "預估達標週", motivation: "動力卡", keepMomentum: "從補充建議走向穩定複檢",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的維生素D規劃帶回家", journeyHint: "補充 8–12 週後再次驗血校正劑量；脂溶性維生素隨餐服用吸收較佳。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 BMI 確認體重是否影響劑量需求", nextActionItem2: "用 Water Intake 維持整體營養與水分平衡", nextActionItem3: "用 Macro 檢視整體飲食與脂肪攝取",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "驗血 → 維生素D → 複檢 / 飲食調整", bmrStep: "驗血濃度", deficitStep: "每日劑量", trendStep: "達標複檢", mealStep: "飲食維持",
    knowledge: "知識", knowledgeTitle: "維生素D在健康宇宙中的意義", definition: "定義", definitionText: "維生素D是脂溶性維生素，調節鈣磷代謝與骨骼健康，也參與免疫調節；血清 25(OH)D 是評估體內存量的標準指標。", formula: "公式", formulaText: "需提升 = 目標濃度 − 目前濃度(ng/mL)。每日劑量 ≈ 需提升 × 100 IU × 日照係數，並加上依年齡的維持劑量(600–800 IU)。", limitations: "限制", limitationsText: "個人吸收率差異大；肥胖者需求較高；腎肝疾病、肉芽腫疾病與部分用藥需個別評估。上限通常為 4000 IU/日。", interpretation: "解讀", interpretationText: "30–50 ng/mL 為多數指引的充足區間；< 20 為缺乏。補充後須複檢，避免長期高劑量導致過量。", context: "脈絡", contextText: "維生素D規劃應與整體飲食、體重與日照習慣一起看，並以驗血為準。", example: "範例", exampleText: "目前 18 ng/mL、目標 40、中等日照 → 需提升 22 × 100 = 2200 IU + 維持 600 IU ≈ 約 2800 IU/日。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "營養規劃的下一步工具", premiumTitle: "PRO 營養追蹤包", premiumText: "解鎖補充劑記錄、血清趨勢圖、複檢提醒與個人化營養報告。", feat1: "記錄追蹤", feat2: "趨勢分析", feat3: "提醒", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議；補充前請諮詢醫師並驗血。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Water Intake Calculator · Macro Calculator · Biological Age Calculator", references: "參考資料", referencesText: "Endocrine Society Clinical Practice Guideline on Vitamin D；IOM Dietary Reference Intakes for Calcium and Vitamin D；Holick, Vitamin D Deficiency (NEJM)；NIH ODS Vitamin D Fact Sheet。",
    q1: "我每天需要多少維生素D？", a1: "成人一般維持量為 600–800 IU/日；若驗血顯示缺乏，醫師可能短期給予較高劑量再回到維持量。",
    q2: "為什麼用血清濃度而不是症狀？", a2: "25(OH)D 血清濃度是評估體內存量最可靠的客觀指標，症狀常不專一，容易誤判。",
    q3: "曬太陽可以取代補充劑嗎？", a3: "適度日照能合成維生素D，但受緯度、季節、膚色與防曬影響很大，高緯度冬季常不足。",
    q4: "補太多會中毒嗎？", a4: "會。長期超過上限(成人約 4000 IU/日)可能造成高血鈣，務必依驗血調整並複檢。",
    q5: "孕婦適用嗎？", a5: "孕期與哺乳期需求不同，應由產科或專業人員依驗血個別評估，勿自行高劑量補充。",
    q6: "這個工具能診斷維生素D缺乏嗎？", a6: "不能。它只是教育用估算；確診與治療請依驗血並諮詢專業人員。",
  },
  en: {
    badge: "Health · Supplementation · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Vitamin D Calculator · Vitamin D Planner", subtitle: "Estimate daily intake from current serum level, age, and sun habits",
    intro: "This calculator uses your current serum 25(OH)D level(ng/mL), a target level, and sun-exposure habits to estimate the daily vitamin D intake(IU) needed to raise your serum level into the sufficient range (30–50 ng/mL).",
    trustNoteLabel: "Note:", trustNote: "Estimates use the population average of '~100 IU/day raises serum ~1 ng/mL'; absorption, body weight, kidney/liver function, and medication affect real needs. Consult a doctor and get a blood test before supplementing.",
    quickActionCard: "Quick Action Card", tryExample: "Create a vitamin D example instantly", examplePreview: "Daily recommendation preview", examplePerson: "Current level", fillExample: "One-click standard example", previewActivePath: "Fill low-sun example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter current level, age, and sun", examplesHelper: "Start with an example to understand the link between serum level and recommended intake, then replace with your own blood-test data.",
    metric: "ng/mL (US)", imperial: "nmol/L (EU)", exampleCards: "Example cards", baselineExample: "Adult deficient", activeExample: "Senior low-sun demo", gapLabel: "Gap", baselineExampleNote: "18 ng/mL · Age 35 · Moderate sun", activeExampleNote: "12 ng/mL · Age 72 · Low sun", flowDemo: "Target 40", calculator: "Calculator",
    weight: "Current serum 25(OH)D (ng/mL)", tdee: "Age (years)", goal: "Sun-exposure habit", goalCut: "Low sun", goalMaintain: "Moderate", goalBulk: "High sun",
    resultCard: "Vitamin D Recommendation", unit: "IU/day", primaryValue: "Target level", maintenanceTarget: "Gap to raise (ng/mL)", actionTarget: "Maintenance (IU)", estimatedTdee: "Target level", maintenance: "Gap", fatLossTarget: "Maintain",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card serum-level matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current serum level in common interpretation zones. This is planning guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the vitamin D recommendation into an actionable plan", conversionNote: "L9 values update from the computed result: daily dose, weeks to target, and a retest hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current supplement plan", dailyGap: "Daily dose", weeklyTrend: "Est. weeks to target", motivation: "Motivation Card", keepMomentum: "Move from a dose plan to steady retesting",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's vitamin D plan home", journeyHint: "Retest after 8–12 weeks to calibrate the dose; fat-soluble vitamins absorb better with a meal.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use BMI to see if body weight affects dose needs", nextActionItem2: "Use Water Intake to keep overall nutrition and hydration balanced", nextActionItem3: "Use Macro to review overall diet and fat intake",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Blood test → Vitamin D → Retest / Diet adjust", bmrStep: "Blood level", deficitStep: "Daily dose", trendStep: "Retest at target", mealStep: "Diet maintenance",
    knowledge: "Knowledge", knowledgeTitle: "What vitamin D means in the Health universe", definition: "Definition", definitionText: "Vitamin D is a fat-soluble vitamin that regulates calcium-phosphate metabolism and bone health and supports immune function; serum 25(OH)D is the standard marker of body stores.", formula: "Formula", formulaText: "Gap to raise = target − current (ng/mL). Daily dose ≈ gap × 100 IU × sun factor, plus an age-based maintenance dose (600–800 IU).", limitations: "Limitations", limitationsText: "Absorption varies widely; people with obesity need more; kidney/liver disease, granulomatous disease, and some medications need individual review. The upper limit is usually 4000 IU/day.", interpretation: "Interpretation", interpretationText: "30–50 ng/mL is the sufficient range in most guidelines; < 20 is deficient. Retest after supplementing and avoid long-term high doses to prevent excess.", context: "Context", contextText: "Vitamin D planning should be viewed with overall diet, body weight, and sun habits, and anchored on blood tests.", example: "Example", exampleText: "Current 18 ng/mL, target 40, moderate sun → raise 22 × 100 = 2200 IU + 600 IU maintenance ≈ ~2800 IU/day.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for nutrition planning", premiumTitle: "PRO Nutrition Tracking Pack", premiumText: "Unlock supplement logging, serum trend charts, retest reminders, and personalized nutrition reports.", feat1: "Logging", feat2: "Trends", feat3: "Reminder", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional advice; consult a doctor and get a blood test before supplementing.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Water Intake Calculator · Macro Calculator · Biological Age Calculator", references: "References", referencesText: "Endocrine Society Clinical Practice Guideline on Vitamin D; IOM Dietary Reference Intakes for Calcium and Vitamin D; Holick, Vitamin D Deficiency (NEJM); NIH ODS Vitamin D Fact Sheet.",
    q1: "How much vitamin D do I need daily?", a1: "Adults typically maintain on 600–800 IU/day; if a blood test shows deficiency, a doctor may give a higher short-term dose before returning to maintenance.",
    q2: "Why use serum level instead of symptoms?", a2: "Serum 25(OH)D is the most reliable objective marker of body stores; symptoms are often non-specific and easy to misread.",
    q3: "Can sun exposure replace supplements?", a3: "Moderate sun synthesizes vitamin D, but latitude, season, skin tone, and sunscreen affect it greatly; high-latitude winters are often insufficient.",
    q4: "Can too much be toxic?", a4: "Yes. Long-term intake above the limit (about 4000 IU/day for adults) can cause hypercalcemia; always adjust by blood test and retest.",
    q5: "Is this suitable during pregnancy?", a5: "Needs differ in pregnancy and lactation; an obstetric or professional review based on blood tests is required—avoid self-prescribed high doses.",
    q6: "Can this tool diagnose vitamin D deficiency?", a6: "No. It is an educational estimate; diagnosis and treatment require a blood test and professional advice.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function maintenanceIU(age: number): number {
  if (age >= 71) return 800;
  if (age >= 1) return 600;
  return 400;
}

export default function VitaminDCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [level, setLevel] = useState("18");
  const [age, setAge] = useState("35");
  const [sun, setSun] = useState<Sun>("moderate");
  const t = ui[lang];

  const result = useMemo(() => {
    const cur = Number(level);
    const a = Number(age);
    if (cur < 0 || a <= 0) return null;
    const gap = Math.max(0, TARGET_NG - cur);
    const maint = maintenanceIU(a);
    const correction = gap * IU_PER_NG * sunFactor[sun];
    const dailyIU = correction + maint;
    const weeksToTarget = gap > 0 ? Math.ceil(gap / 2) : 0; // ~2 ng/mL per week at steady dosing
    return { gap, maint, correction, dailyIU, weeksToTarget };
  }, [level, age, sun]);

  const doseDisplay = result ? fmt(result.dailyIU, 0) : "—";
  const gapDisplay = result ? fmt(result.gap, 0) : "—";
  const maintDisplay = result ? fmt(result.maint, 0) : "—";
  const weeksDisplay = result ? fmt(result.weeksToTarget, 0) : "—";

  function fillStandard() { setUnit("metric"); setLevel("18"); setAge("35"); setSun("moderate"); }
  function fillCut() { setUnit("metric"); setLevel("12"); setAge("72"); setSun("low"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{doseDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{level}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{sun === "low" ? "🌥️" : sun === "high" ? "☀️" : "⛅"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~2800</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~3920</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={level} onChange={(e) => setLevel(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sun} onChange={(e) => setSun(e.target.value as Sun)}><option value="low">{t.goalCut}</option><option value="moderate">{t.goalMaintain}</option><option value="high">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{doseDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{TARGET_NG} ng/mL</div><div className="mt-1 text-xs text-slate-300">{level} → {TARGET_NG}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{gapDisplay}</p><p className="text-sm font-bold text-blue-700">ng/mL</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{maintDisplay}</p><p className="text-sm font-bold text-emerald-700">IU</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">WEEKS</div><div className="mt-1 text-xs font-black uppercase text-orange-700">To target</div><p className="mt-2 text-3xl font-black text-orange-950">{weeksDisplay}</p><p className="text-sm font-bold text-orange-700">wk</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{doseDisplay} <span className="text-sm text-slate-500">IU</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="vitamin-d-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.dailyGap}</div><div className="mt-1 text-3xl font-black">{doseDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.gapLabel}</div><div className="mt-1 text-3xl font-black text-blue-950">{gapDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{weeksDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Test", note: t.bmrStep }, { label: "Dose", note: t.deficitStep }, { label: "Retest", note: t.trendStep }, { label: "Diet", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="vitamin-d-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
