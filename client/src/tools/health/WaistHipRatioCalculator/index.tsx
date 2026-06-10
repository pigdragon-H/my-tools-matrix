// @profile B
// Profile B · Calculator-YMYL · WaistHipRatioCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Sex = "male" | "female";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "male-low", range: "♂ < 0.90", label: { zh: "男性 · 低風險", en: "Male · Low risk" }, desc: { zh: "脂肪分布健康，心血管代謝風險較低。", en: "Healthy fat distribution; lower cardiometabolic risk." } },
  { key: "male-mod", range: "♂ 0.90–0.99", label: { zh: "男性 · 中風險", en: "Male · Moderate" }, desc: { zh: "腹部脂肪偏多，建議調整飲食與運動。", en: "Elevated abdominal fat; adjust diet and exercise." } },
  { key: "male-high", range: "♂ ≥ 1.00", label: { zh: "男性 · 高風險", en: "Male · High risk" }, desc: { zh: "中央肥胖明顯，心血管風險升高。", en: "Central obesity; raised cardiovascular risk." } },
  { key: "female-low", range: "♀ < 0.80", label: { zh: "女性 · 低風險", en: "Female · Low risk" }, desc: { zh: "脂肪分布健康，代謝風險較低。", en: "Healthy fat distribution; lower metabolic risk." } },
  { key: "female-mod", range: "♀ 0.80–0.84", label: { zh: "女性 · 中風險", en: "Female · Moderate" }, desc: { zh: "腰部脂肪偏多，建議生活型態調整。", en: "Elevated waist fat; lifestyle adjustment advised." } },
  { key: "female-high", range: "♀ ≥ 0.85", label: { zh: "女性 · 高風險", en: "Female · High risk" }, desc: { zh: "中央肥胖明顯，代謝症候群風險升高。", en: "Central obesity; raised metabolic syndrome risk." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "體脂率計算機", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 體態評估 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "腰臀比計算機 · WHR Analyzer", subtitle: "用腰圍與臀圍評估脂肪分布與心血管代謝風險",
    intro: "Waist-Hip Ratio Calculator 依據腰圍(cm)與臀圍(cm)計算腰臀比（WHR = 腰圍 ÷ 臀圍），並依世界衛生組織性別分級判讀脂肪分布型態與相對健康風險。",
    trustNoteLabel: "注意事項：", trustNote: "WHR 閾值為 WHO 一般成人標準；孕婦、運動員、特殊體型與不同族群應個別評估，本工具僅供教育參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立腰臀比範例", examplePreview: "腰臀比預覽", examplePerson: "腰圍", fillExample: "一鍵填入標準範例", previewActivePath: "填入高風險範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入腰圍與臀圍", examplesHelper: "先用範例理解腰臀比分級，再改成自己的腰圍與臀圍量測值。",
    metric: "公制 (cm)", imperial: "英制 (in)", exampleCards: "範例卡", baselineExample: "健康男性範例", activeExample: "高風險範例", ratioLabel: "比值", flowDemo: "臀圍 100", calculator: "計算機",
    weight: "腰圍 (cm)", tdee: "臀圍 (cm)", goal: "生理性別", goalCut: "男性", goalMaintain: "女性", goalBulk: "—",
    resultCard: "腰臀比評估結果", unit: "WHR 比值", primaryValue: "風險分級", maintenanceTarget: "腰圍", actionTarget: "臀圍", estimatedTdee: "WHR", maintenance: "Waist", fatLossTarget: "Hip",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格腰臀比判讀矩陣", tdeeMatrixNote: "L7 固定六格，依性別將 WHR 放進 WHO 常見風險區間；這是評估參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把腰臀比結果轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示比值、風險分級與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前體態評估", dailyGap: "腰圍差", weeklyTrend: "比值", motivation: "動力卡", keepMomentum: "從腰臀比評估走向穩定體態管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的體態評估帶回家", journeyHint: "用同一時段、放鬆站姿重複量測，避免被姿勢與進食差異誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 BMI 確認整體體重狀態是否合理", nextActionItem2: "用體脂率檢查脂肪量是否偏高", nextActionItem3: "用 TDEE 或 Macro 規劃飲食與運動調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "BMI → WHR → 體脂率 / TDEE", bmrStep: "BMI", deficitStep: "腰臀比", trendStep: "體脂率", mealStep: "飲食調整",
    knowledge: "知識", knowledgeTitle: "腰臀比在健康宇宙中的意義", definition: "定義", definitionText: "腰臀比（WHR）是腰圍除以臀圍的比值，用來反映脂肪分布型態，特別是中央（腹部）肥胖程度。", formula: "公式", formulaText: "WHR = 腰圍(cm) ÷ 臀圍(cm)。男性風險閾值約 0.90 與 1.00；女性約 0.80 與 0.85（WHO 標準）。", limitations: "限制", limitationsText: "量測位置與姿勢會影響結果；孕婦、肌肉量極高者、不同族群閾值可能不同，需個別判讀。", interpretation: "解讀", interpretationText: "比值越高代表中央脂肪越多，與心血管疾病、第二型糖尿病風險相關；應結合 BMI 與體脂率一起看。", context: "脈絡", contextText: "WHR 是 BMI 的補充指標，能補捉 BMI 看不到的脂肪分布資訊，建議與體脂率追蹤並用。", example: "範例", exampleText: "腰圍 90 cm、臀圍 100 cm → WHR = 0.90。若為男性屬中風險起點，女性則已偏高。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "體態評估的下一步工具", premiumTitle: "PRO 體態追蹤包", premiumText: "解鎖腰臀比趨勢圖、多部位圍度記錄、風險變化提醒與個人化體態報告。", feat1: "趨勢分析", feat2: "圍度", feat3: "警示", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與評估用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Body Fat Calculator · TDEE Calculator · Macro Calculator", references: "參考資料", referencesText: "WHO Waist Circumference and Waist–Hip Ratio Report (2008); NIH Clinical Guidelines on Obesity; ACC/AHA Cardiovascular Risk Guidelines; IDF Metabolic Syndrome Definition。",
    q1: "腰臀比和 BMI 有什麼差別？", a1: "BMI 看整體體重與身高關係，WHR 看脂肪分布；兩者互補，WHR 更能反映腹部肥胖風險。",
    q2: "為什麼男女閾值不同？", a2: "生理上女性臀部脂肪通常較多、腰部較少，故安全閾值（0.80/0.85）低於男性（0.90/1.00）。",
    q3: "腰圍要量哪個位置？", a3: "通常量肚臍附近或最窄處，放鬆站姿、正常吐氣後量，避免吸氣或用力收腹。",
    q4: "WHR 可以用於減重追蹤嗎？", a4: "可以。減去腹部脂肪時 WHR 會下降，是補充 BMI 的良好進度指標。",
    q5: "孕婦適用嗎？", a5: "不適用。懷孕會改變腰圍，WHR 無法正確反映脂肪分布，請諮詢專業人員。",
    q6: "這個工具能診斷心血管疾病或代謝症候群嗎？", a6: "不能。它只是教育用估算；若有疾病、懷孕、用藥或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Body Assessment · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Waist-Hip Ratio Calculator · WHR Analyzer", subtitle: "Assess fat distribution and cardiometabolic risk from waist and hip",
    intro: "This calculator uses waist(cm) and hip(cm) circumference to compute waist-hip ratio (WHR = waist ÷ hip) and interprets fat distribution pattern and relative health risk using WHO sex-specific thresholds.",
    trustNoteLabel: "Note:", trustNote: "WHR thresholds are WHO general-adult standards; pregnancy, athletes, special body types, and different ethnicities need individual assessment. This tool is for education only.",
    quickActionCard: "Quick Action Card", tryExample: "Create a WHR example instantly", examplePreview: "WHR preview", examplePerson: "Waist", fillExample: "One-click standard example", previewActivePath: "Fill high-risk example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter waist and hip", examplesHelper: "Start with an example to understand WHR grading, then replace with your own waist and hip measurements.",
    metric: "Metric (cm)", imperial: "Imperial (in)", exampleCards: "Example cards", baselineExample: "Healthy male example", activeExample: "High-risk example", ratioLabel: "Ratio", flowDemo: "Hip 100", calculator: "Calculator",
    weight: "Waist (cm)", tdee: "Hip (cm)", goal: "Biological sex", goalCut: "Male", goalMaintain: "Female", goalBulk: "—",
    resultCard: "WHR Assessment Result", unit: "WHR value", primaryValue: "Risk grade", maintenanceTarget: "Waist", actionTarget: "Hip", estimatedTdee: "WHR", maintenance: "Waist", fatLossTarget: "Hip",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card WHR interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place WHR into WHO common risk zones by sex. This is assessment guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn WHR result into an actionable plan", conversionNote: "L9 values update from the computed result: ratio, risk grade, and daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current body assessment", dailyGap: "Waist gap", weeklyTrend: "Ratio", motivation: "Motivation Card", keepMomentum: "Move from WHR estimate to consistent body management",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's body assessment home", journeyHint: "Re-measure at the same time of day in a relaxed standing posture to avoid posture and meal-related variation.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm overall weight status with BMI Calculator", nextActionItem2: "Check fat amount with Body Fat Calculator", nextActionItem3: "Use TDEE or Macro to plan diet and exercise adjustments",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "BMI → WHR → Body Fat / TDEE", bmrStep: "BMI", deficitStep: "WHR", trendStep: "Body fat", mealStep: "Diet adjust",
    knowledge: "Knowledge", knowledgeTitle: "What WHR means in the Health universe", definition: "Definition", definitionText: "Waist-hip ratio (WHR) is waist divided by hip circumference, reflecting fat distribution pattern, especially central (abdominal) obesity.", formula: "Formula", formulaText: "WHR = waist(cm) ÷ hip(cm). Male risk thresholds ~0.90 and 1.00; female ~0.80 and 0.85 (WHO standard).", limitations: "Limitations", limitationsText: "Measurement site and posture affect results; pregnancy, very high muscle mass, and different ethnicities may have different thresholds and need individual interpretation.", interpretation: "Interpretation", interpretationText: "A higher ratio means more central fat, associated with cardiovascular disease and type-2 diabetes risk; view together with BMI and body fat.", context: "Context", contextText: "WHR complements BMI by capturing fat distribution that BMI misses; pair it with body fat tracking.", example: "Example", exampleText: "Waist 90 cm, hip 100 cm → WHR = 0.90. For a male this is the moderate-risk starting point; for a female it is already elevated.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for body assessment", premiumTitle: "PRO Body Tracking Pack", premiumText: "Unlock WHR trend charts, multi-site girth logging, risk-change alerts, and personalized body reports.", feat1: "Trends", feat2: "Girth", feat3: "Alerts", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and assessment. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Body Fat Calculator · TDEE Calculator · Macro Calculator", references: "References", referencesText: "WHO Waist Circumference and Waist–Hip Ratio Report (2008); NIH Clinical Guidelines on Obesity; ACC/AHA Cardiovascular Risk Guidelines; IDF Metabolic Syndrome Definition.",
    q1: "What's the difference between WHR and BMI?", a1: "BMI looks at overall weight-to-height; WHR looks at fat distribution. They are complementary, and WHR better reflects abdominal obesity risk.",
    q2: "Why do thresholds differ between sexes?", a2: "Physiologically, women carry more hip fat and less waist fat, so safe thresholds (0.80/0.85) are lower than for men (0.90/1.00).",
    q3: "Where should I measure the waist?", a3: "Usually near the navel or the narrowest point, in a relaxed standing posture after a normal exhale — avoid inhaling or sucking in.",
    q4: "Can WHR be used for weight-loss tracking?", a4: "Yes. As abdominal fat is lost, WHR drops; it's a good progress indicator that complements BMI.",
    q5: "Is this suitable during pregnancy?", a5: "No. Pregnancy changes the waist, so WHR cannot correctly reflect fat distribution. Consult a professional.",
    q6: "Can this tool diagnose cardiovascular disease or metabolic syndrome?", a6: "No. It is an educational estimate; consult professionals for disease, pregnancy, medication, or special conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function whrGrade(whr: number, sex: Sex): { key: string; grade: number } {
  if (sex === "male") {
    if (whr < 0.90) return { key: "male-low", grade: 1 };
    if (whr < 1.00) return { key: "male-mod", grade: 2 };
    return { key: "male-high", grade: 3 };
  }
  if (whr < 0.80) return { key: "female-low", grade: 1 };
  if (whr < 0.85) return { key: "female-mod", grade: 2 };
  return { key: "female-high", grade: 3 };
}

export default function WaistHipRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [waistCm, setWaistCm] = useState("80");
  const [hipCm, setHipCm] = useState("100");
  const [sex, setSex] = useState<Sex>("male");
  const t = ui[lang];

  const result = useMemo(() => {
    const waist = Number(waistCm);
    const hip = Number(hipCm);
    if (waist <= 0 || hip <= 0) return null;
    const whr = waist / hip;
    const g = whrGrade(whr, sex);
    const gradeLabel = g.grade === 1 ? (lang === "zh" ? "低風險" : "Low") : g.grade === 2 ? (lang === "zh" ? "中風險" : "Moderate") : (lang === "zh" ? "高風險" : "High");
    return { whr, waist, hip, gradeKey: g.key, grade: g.grade, gradeLabel };
  }, [waistCm, hipCm, sex, lang]);

  const whrDisplay = result ? fmt(result.whr, 2) : "—";
  const waistDisplay = result ? fmt(result.waist, 0) : "—";
  const hipDisplay = result ? fmt(result.hip, 0) : "—";
  const gradeDisplay = result ? result.gradeLabel : "—";

  function fillStandard() { setUnit("metric"); setWaistCm("80"); setHipCm("100"); setSex("male"); }
  function fillHighRisk() { setUnit("metric"); setWaistCm("100"); setHipCm("98"); setSex("male"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{whrDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{waistCm} cm</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{hipCm}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{sex === "male" ? "♂" : "♀"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighRisk} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">0.80</span></div><p className="mt-2 text-sm text-slate-600">80 cm · 100 cm · ♂</p></button><button onClick={fillHighRisk} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1.02</span></div><p className="mt-2 text-sm text-slate-600">100 cm · 98 cm · ♂</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={hipCm} onChange={(e) => setHipCm(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="male">{t.goalCut}</option><option value="female">{t.goalMaintain}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{whrDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{gradeDisplay}</div><div className="mt-1 text-xs text-slate-300">{sex === "male" ? "MALE" : "FEMALE"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{waistDisplay}</p><p className="text-sm font-bold text-blue-700">cm</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{hipDisplay}</p><p className="text-sm font-bold text-emerald-700">cm</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">WHR</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.ratioLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{whrDisplay}</p><p className="text-sm font-bold text-orange-700">{result ? `G${result.grade}` : "—"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && result.gradeKey === item.key ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{whrDisplay} <span className="text-sm text-slate-500">WHR</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="whr-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">WHR</div><div className="mt-1 text-3xl font-black">{whrDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.waist - result.hip, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{whrDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMI", note: t.bmrStep }, { label: "WHR", note: t.deficitStep }, { label: "Body Fat", note: t.trendStep }, { label: "Diet", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="whr-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
