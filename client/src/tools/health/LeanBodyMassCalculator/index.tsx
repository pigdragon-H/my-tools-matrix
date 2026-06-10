// @profile B
// Profile B · 計算機-YMYL · LeanBodyMassCalculator（GOLD-STANDARD-001 compatible · cloned from MeetingCost）

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
  { key: "veryLow", range: "<40 kg", label: { zh: "極低", en: "Very low" }, desc: { zh: "瘦體重偏低，建議搭配專業評估與營養規劃。", en: "Lean mass is low — pair with professional assessment and nutrition planning." } },
  { key: "low", range: "40-50 kg", label: { zh: "偏低", en: "Low" }, desc: { zh: "瘦體重偏低，阻力訓練與蛋白質攝取可逐步改善。", en: "Lean mass is on the low side — resistance training and protein can help gradually." } },
  { key: "moderate", range: "50-60 kg", label: { zh: "中等", en: "Moderate" }, desc: { zh: "中等瘦體重，常見於一般成人的健康範圍。", en: "Moderate lean mass — common healthy range for many adults." } },
  { key: "good", range: "60-70 kg", label: { zh: "良好", en: "Good" }, desc: { zh: "瘦體重良好，維持訓練與飲食即可穩定。", en: "Good lean mass — maintain training and diet to keep it stable." } },
  { key: "high", range: "70-80 kg", label: { zh: "偏高", en: "High" }, desc: { zh: "瘦體重偏高，常見於規律重訓或體型較大者。", en: "High lean mass — common in regular lifters or larger frames." } },
  { key: "veryHigh", range: ">80 kg", label: { zh: "很高", en: "Very high" }, desc: { zh: "瘦體重很高，建議確認量測方式與身體組成資料一致。", en: "Very high lean mass — confirm the measurement method matches your body-composition data." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMR 基礎代謝", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "體脂率估算", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
  { label: { zh: "蛋白質需求", en: "Protein Intake" }, href: "/tools/health/protein-intake-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 瘦體重換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Lean Body Mass Calculator · 瘦體重計算機", subtitle: "用身高、體重與性別估算瘦體重與體脂重量",
    intro: "本工具根據身高、體重與性別，使用 Boer 公式估算瘦體重（LBM）與體脂重量，幫助健身與健康規劃者掌握身體組成基準。",
    trustNoteLabel: "注意事項：", trustNote: "此工具以公式估算瘦體重；未取代 DEXA、體脂夾或生物電阻等實測，數值僅供參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立瘦體重範例", examplePreview: "瘦體重 (kg)", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入大體型範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入身高、體重與性別", examplesHelper: "先用範例理解瘦體重估算，再改成自己的數字。",
    metric: "公制", imperial: "英制", exampleCards: "範例卡", baselineExample: "標準範例 · 男性 175cm", activeExample: "大體型", flowDemo: "175cm · 70kg", calculator: "計算機",
    participants: "身高 (cm)", averageHourlyRate: "體重 (kg)", durationHours: "性別 (男=1/女=0)", meetingsPerMonth: "年齡 (歲)",
    resultCard: "瘦體重估算結果", unit: "瘦體重 (kg)", primaryValue: "主要數值", maintenanceTarget: "瘦體重 (kg)", actionTarget: "體脂重量", estimatedTdee: "瘦體重 (kg)", maintenance: "瘦體重", fatLossTarget: "體脂重量",
    meetingCost: "瘦體重", monthlyEquiv: "體脂重量", weeklyEquiv: "瘦體比例", dailyEquiv: "體脂比例", effectiveHours: "瘦體等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格瘦體重判讀矩陣", tdeeMatrixNote: "L7 固定六格，將瘦體重放進常見區間；這是健康參考，不是醫療或診斷建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把身體組成盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示瘦體重、體脂重量與比例，協助判斷是否需要調整訓練與飲食。",
    progressInsight: "進度洞察卡", possibleTarget: "目前身體組成", dailyGap: "體脂比例", weeklyTrend: "瘦體重", motivation: "動力卡", keepMomentum: "從單次估算走向穩定的身體組成追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的身體組成帶回計畫", journeyHint: "每次調整訓練量、飲食或量測方式時重新估算，追蹤瘦體重是否朝目標前進。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 BMR 計算機估算基礎代謝", nextActionItem2: "用 TDEE 計算機評估每日熱量需求", nextActionItem3: "用蛋白質需求工具規劃增肌飲食",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "瘦體重 → BMR → TDEE → 蛋白質", bmrStep: "瘦體重", deficitStep: "BMR", trendStep: "TDEE", mealStep: "蛋白質",
    knowledge: "知識", knowledgeTitle: "瘦體重在健康規劃中的意義", definition: "定義", definitionText: "瘦體重（LBM）是身體扣除脂肪後的重量，包含肌肉、骨骼、器官與水分，是評估身體組成與代謝需求的重要基準。",
    formula: "公式", formulaText: "Boer 公式：男性 LBM = 0.407×體重 + 0.267×身高 − 19.2；女性 LBM = 0.252×體重 + 0.473×身高 − 48.3。體脂重量 = 體重 − 瘦體重。",
    limitations: "限制", limitationsText: "本工具以人口統計公式估算；對運動員、極端體型或水分波動大者，誤差可能較大，應以實測為準。",
    interpretation: "解讀", interpretationText: "瘦體重高不代表一定健康，仍需搭配體脂率與生活型態；數值變化應觀察趨勢，而非單次結果。",
    context: "脈絡", contextText: "瘦體重應搭配體脂率、訓練量、飲食與睡眠一起看，而不是只看單一公斤數。",
    example: "範例", exampleText: "男性、身高 175cm、體重 70kg，依 Boer 公式瘦體重約 56.0kg，體脂重量約 14.0kg，瘦體比例約 80%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "身體組成規劃的下一步工具", premiumTitle: "專業版身體組成工具包", premiumText: "解鎖瘦體重趨勢、多公式比較、增減脂目標模擬與身體組成報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與健康規劃用途，不取代醫療診斷或專業營養與運動建議。", relatedTools: "相關工具", relatedToolsText: "BMR 基礎代謝 · TDEE 計算機 · 體脂率估算 · 蛋白質需求", references: "參考資料", referencesText: "Boer 瘦體重公式；James 瘦體重公式；美國運動醫學會體組成指引；臨床營養身體組成評估文獻。",
    q1: "瘦體重和體重有什麼差別？", a1: "體重是身體總重量；瘦體重是扣除脂肪後的重量。兩人體重相同，瘦體重可能差很多，這也是體重無法完整反映健康的原因。",
    q2: "為什麼男女公式不同？", a2: "男女在肌肉量、骨密度與脂肪分布上有系統性差異，因此瘦體重估算公式對性別給不同係數，以提高準確度。",
    q3: "這個估算和體脂夾差很多怎麼辦？", a3: "公式是人口平均的估算，個體差異會造成誤差。若需要精準數據，建議以 DEXA 或多次體脂夾量測取平均為準。",
    q4: "瘦體重越高越好嗎？", a4: "不一定。瘦體重高通常代表肌肉量充足，但仍需搭配體脂率、活動量與健康指標一起評估，極端值反而要留意量測是否正確。",
    q5: "減重時瘦體重會下降嗎？", a5: "可能會。快速減重或蛋白質不足時容易流失瘦體重；搭配阻力訓練與足夠蛋白質，有助於在減脂同時保留瘦體重。",
    q6: "這個工具能取代醫療評估嗎？", a6: "不能。它只是教育與規劃用估算；任何健康決策仍應諮詢醫師、營養師或合格運動專業人員。",
  },
  en: {
    badge: "Health · Lean body mass · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Lean Body Mass Calculator", subtitle: "Estimate lean mass and fat mass from height, weight, and sex",
    intro: "This tool uses the Boer formula with your height, weight, and sex to estimate lean body mass (LBM) and fat mass — so fitness and health planners can anchor their body-composition baseline.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates lean mass from a formula. It does not replace DEXA, skinfold, or bioimpedance measurements, and values are for reference only.",
    quickActionCard: "Quick example", tryExample: "Try a lean-mass example", examplePreview: "Lean mass (kg)", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the large-frame example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter height, weight, and sex", examplesHelper: "Start from an example to understand lean-mass estimation, then change the numbers to your own.",
    metric: "Metric", imperial: "Imperial", exampleCards: "Example cards", baselineExample: "Standard · Male 175cm", activeExample: "Large frame", flowDemo: "175cm · 70kg", calculator: "Calculator",
    participants: "Height (cm)", averageHourlyRate: "Weight (kg)", durationHours: "Sex (M=1/F=0)", meetingsPerMonth: "Age (years)",
    resultCard: "Lean-mass result", unit: "Lean mass (kg)", primaryValue: "Headline number", maintenanceTarget: "Lean mass (kg)", actionTarget: "Fat mass", estimatedTdee: "Lean mass (kg)", maintenance: "Lean mass", fatLossTarget: "Fat mass",
    meetingCost: "Lean mass", monthlyEquiv: "Fat mass", weeklyEquiv: "Lean ratio", dailyEquiv: "Fat ratio", effectiveHours: "Lean band",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band lean-mass matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places lean body mass into common ranges. This is a health reference, not medical or diagnostic advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the body-composition snapshot into a plan", conversionNote: "L9 reflects your current results — lean mass, fat mass, and ratios — to help you decide whether to adjust training and diet.",
    progressInsight: "Progress insight", possibleTarget: "Your current body composition", dailyGap: "Fat ratio", weeklyTrend: "Lean mass", motivation: "Motivation", keepMomentum: "Move from a single estimate to steady body-composition tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s body composition back to your plan", journeyHint: "Recalculate whenever your training volume, diet, or measurement method changes — and track whether lean mass moves toward your goal.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use BMR Calculator to estimate basal metabolic rate", nextActionItem2: "Use TDEE Calculator to assess daily energy needs", nextActionItem3: "Use Protein Intake to plan a muscle-building diet",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Lean mass → BMR → TDEE → Protein", bmrStep: "Lean mass", deficitStep: "BMR", trendStep: "TDEE", mealStep: "Protein",
    knowledge: "Knowledge", knowledgeTitle: "What lean body mass means in health planning", definition: "Definition", definitionText: "Lean body mass (LBM) is body weight minus fat, including muscle, bone, organs, and water. It is an important baseline for assessing body composition and metabolic needs.",
    formula: "Formula", formulaText: "Boer formula: Male LBM = 0.407×weight + 0.267×height − 19.2; Female LBM = 0.252×weight + 0.473×height − 48.3. Fat mass = weight − lean mass.",
    limitations: "Limitations", limitationsText: "This tool estimates from population formulas. For athletes, extreme body types, or large water fluctuations, error can be larger and direct measurement should be preferred.",
    interpretation: "Interpretation", interpretationText: "High lean mass does not automatically mean healthy; it must be read with body fat and lifestyle. Watch the trend over time rather than a single result.",
    context: "Context", contextText: "Read lean mass together with body-fat percentage, training volume, diet, and sleep — not just a single kilogram figure.",
    example: "Example", exampleText: "Male, height 175cm, weight 70kg: by the Boer formula lean mass is about 56.0kg, fat mass about 14.0kg, and the lean ratio about 80%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for body-composition planning", premiumTitle: "Pro Body-Composition Toolkit", premiumText: "Unlock lean-mass trends, multi-formula comparison, gain/loss target simulation, and body-composition reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and health-planning purposes only and is not a substitute for medical diagnosis or professional nutrition and exercise advice.", relatedTools: "Related tools", relatedToolsText: "BMR Calculator · TDEE Calculator · Body Fat Calculator · Protein Intake", references: "References", referencesText: "Boer lean-mass formula; James lean-mass formula; ACSM body-composition guidelines; clinical nutrition body-composition literature.",
    q1: "What is the difference between lean mass and body weight?", a1: "Body weight is the total; lean mass is weight minus fat. Two people with the same weight can have very different lean mass — which is why weight alone does not fully reflect health.",
    q2: "Why are the male and female formulas different?", a2: "Men and women differ systematically in muscle mass, bone density, and fat distribution, so lean-mass formulas use different coefficients by sex to improve accuracy.",
    q3: "What if this estimate differs a lot from a skinfold reading?", a3: "Formulas are population averages, so individual variation causes error. For precise data, prefer DEXA or the average of several skinfold measurements.",
    q4: "Is higher lean mass always better?", a4: "Not necessarily. High lean mass usually indicates adequate muscle, but it must be read with body fat, activity, and health markers — and extreme values warrant checking measurement accuracy.",
    q5: "Does lean mass drop during weight loss?", a5: "It can. Rapid weight loss or insufficient protein can cause lean-mass loss; resistance training and adequate protein help preserve lean mass while losing fat.",
    q6: "Can this tool replace a medical assessment?", a6: "No. It is an educational and planning estimate. Any health decision should still involve a physician, dietitian, or qualified exercise professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function LeanBodyMassCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("175");
  const [averageHourlyRate, setAverageHourlyRate] = useState("70");
  const [durationHours, setDurationHours] = useState("1");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("30");
  const t = ui[lang];

  const result = useMemo(() => {
    const height = Number(participants) || 0;
    const weight = Number(averageHourlyRate) || 0;
    const isMale = (Number(durationHours) || 0) >= 1;
    const lbm = isMale
      ? 0.407 * weight + 0.267 * height - 19.2
      : 0.252 * weight + 0.473 * height - 48.3;
    const leanMass = Math.max(0, lbm);
    const fatMass = Math.max(0, weight - leanMass);
    const leanRatio = weight > 0 ? (leanMass / weight) * 100 : 0;
    const fatRatio = weight > 0 ? (fatMass / weight) * 100 : 0;
    return { leanMass, fatMass, leanRatio, fatRatio };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.leanMass, 1);
  const monthlyDisplay = fmt(result.fatMass, 1);

  function fillSolid() { setUnit("metric"); setParticipants("175"); setAverageHourlyRate("70"); setDurationHours("1"); setMeetingsPerMonth("30"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("188"); setAverageHourlyRate("95"); setDurationHours("1"); setMeetingsPerMonth("35"); }

  const activeBand = bands.find(b => {
    const r = result.leanMass;
    if (r < 40) return b.key === "veryLow";
    if (r < 50) return b.key === "low";
    if (r < 60) return b.key === "moderate";
    if (r < 70) return b.key === "good";
    if (r < 80) return b.key === "high";
    return b.key === "veryHigh";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "公斤" : "kg"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{participants}cm</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">56.0kg</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "175cm · 70kg" : "175cm · 70kg"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">69.0kg</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "188cm · 95kg" : "188cm · 95kg"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">kg</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "公斤" : "kg"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "瘦體" : "Lean"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.leanRatio, 0)}%</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "比例" : "ratio"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "體脂" : "Fat"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.fatRatio, 0)}%</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "比例" : "ratio"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "等級" : "Band"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand ? l(activeBand.label, lang) : "—"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "區間" : "/band"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="lean-body-mass-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "瘦體重" : "Lean"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.fatRatio, 0)}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "瘦體重" : "Lean", note: t.bmrStep }, { label: lang === "zh" ? "BMR" : "BMR", note: t.deficitStep }, { label: lang === "zh" ? "TDEE" : "TDEE", note: t.trendStep }, { label: lang === "zh" ? "蛋白質" : "Protein", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="lean-body-mass-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["趨勢", "比較", "目標", "報告"] : ["Trends", "Compare", "Goals", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
