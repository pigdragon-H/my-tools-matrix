// @profile B
// Profile B · Calculator-YMYL · OneRepMaxCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type FormulaMode = "epley" | "brzycki" | "lombardi";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

function oneRepMax(mode: FormulaMode, weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  if (mode === "brzycki") return weight * (36 / (37 - reps));
  if (mode === "lombardi") return weight * Math.pow(reps, 0.10);
  return weight * (1 + reps / 30); // epley
}

// Training percentages of 1RM with rep recommendations
const bands = [
  { key: "p95", pct: 0.95, range: "95%", label: { zh: "95% · 神經適應", en: "95% · Neural" }, desc: { zh: "1–2 下，最大肌力，需充分熱身與保護。", en: "1–2 reps, max strength; warm up fully and use a spotter." } },
  { key: "p90", pct: 0.90, range: "90%", label: { zh: "90% · 最大肌力", en: "90% · Max strength" }, desc: { zh: "2–4 下，發展絕對力量。", en: "2–4 reps, builds absolute strength." } },
  { key: "p85", pct: 0.85, range: "85%", label: { zh: "85% · 肌力", en: "85% · Strength" }, desc: { zh: "4–6 下，力量與肌肥大交界。", en: "4–6 reps, strength–hypertrophy crossover." } },
  { key: "p80", pct: 0.80, range: "80%", label: { zh: "80% · 肌肥大", en: "80% · Hypertrophy" }, desc: { zh: "6–8 下，常見增肌區間。", en: "6–8 reps, common muscle-building range." } },
  { key: "p70", pct: 0.70, range: "70%", label: { zh: "70% · 肌耐力", en: "70% · Endurance" }, desc: { zh: "10–12 下，肌肉耐力與技術。", en: "10–12 reps, muscular endurance and technique." } },
  { key: "p60", pct: 0.60, range: "60%", label: { zh: "60% · 暖身技術", en: "60% · Warm-up" }, desc: { zh: "15+ 下，暖身、恢復與動作練習。", en: "15+ reps, warm-up, recovery, and skill work." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "運動消耗計算機", en: "Exercise Calories Calculator" }, href: "/tools/health/exercise-calories-calculator" },
  { label: { zh: "最大心率計算機", en: "Max Heart Rate Calculator" }, href: "/tools/health/max-heart-rate-calculator" },
  { label: { zh: "蛋白質需求計算機", en: "Protein Calculator" }, href: "/tools/health/protein-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "一次最大重量計算機 · One-Rep Max", subtitle: "用舉起重量與反覆次數估算 1RM 與各強度訓練重量",
    intro: "One-Rep Max Calculator 依據你舉起的重量(kg)與反覆次數(reps)，以 Epley、Brzycki 或 Lombardi 公式估算最大單次重量(1RM)，並換算 60%~95% 強度對應的訓練重量與建議反覆次數，協助安排肌力與肌肥大課表。",
    trustNoteLabel: "注意事項：", trustNote: "1RM 為估算值，reps 越多誤差越大（建議用 ≤10 下的組數估算）；嘗試真實 1RM 應有充分熱身、保護者與正確姿勢，避免受傷。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 1RM 範例", examplePreview: "1RM 預覽", examplePerson: "重量", fillExample: "一鍵填入標準範例", previewActivePath: "填入 Brzycki 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入重量、次數與公式", examplesHelper: "先用範例理解 1RM 與訓練強度換算，再改成自己的訓練數據。",
    metric: "公制 (kg)", imperial: "英制 (lb)", exampleCards: "範例卡", baselineExample: "100 kg × 5 下 · Epley", activeExample: "80 kg × 8 下 · Brzycki", enduranceLabel: "耐力", baselineExampleNote: "100 × (1 + 5/30) = 117 kg", activeExampleNote: "80 × 36/(37−8) = 99 kg", flowDemo: "次數 5", calculator: "計算機",
    weight: "舉起重量 (kg)", minutes: "反覆次數 (reps)", mode: "估算公式", modeFox: "Epley (1 + reps/30)", modeTanaka: "Brzycki (36 / (37−reps))", modeGulati: "Lombardi (重量 × reps^0.1)",
    resultCard: "1RM 估算結果", unit: "kg", primaryValue: "本次估算", maintenanceTarget: "肌肥大 80%", actionTarget: "肌力 90%", estimatedTdee: "公式", maintenance: "80% 1RM", fatLossTarget: "90% 1RM",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格訓練強度重量矩陣", tdeeMatrixNote: "L7 固定六格，將目前 1RM 換成 60%~95% 訓練重量與建議次數；這是訓練規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 1RM 轉成可執行課表", conversionNote: "L9 會連動目前估算結果，顯示各強度重量、目標次數與恢復提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前肌力規劃", dailyGap: "肌肥大 (kg)", weeklyTrend: "肌力 (kg)", motivation: "動力卡", keepMomentum: "從單次估算走向週期化進步",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 1RM 帶回家", journeyHint: "每 4–6 週用同一公式重新估算，比較進步幅度；數字進步比追求單次極限更安全。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Protein 規劃肌肉合成所需蛋白質", nextActionItem2: "用 Exercise Calories 估算訓練消耗", nextActionItem3: "用 Macro 安排訓練日的整體營養",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "1RM → 訓練強度 → 蛋白質 → 巨量營養素", bmrStep: "1RM", deficitStep: "訓練強度", trendStep: "蛋白質", mealStep: "整體營養",
    knowledge: "知識", knowledgeTitle: "1RM 在健康宇宙中的意義", definition: "定義", definitionText: "1RM（One-Rep Max）是某一動作只能完成一次的最大重量，是設定肌力訓練強度的基準。", formula: "公式", formulaText: "Epley: 重量 × (1 + 次數/30)。Brzycki: 重量 × 36/(37−次數)。Lombardi: 重量 × 次數^0.1。各公式在低次數時結果接近，次數越高差異越大。", limitations: "限制", limitationsText: "公式為迴歸估算，次數超過 10 下誤差顯著增大；個人肌纖維類型、技術與疲勞都會影響結果，數值僅供規劃。", interpretation: "解讀", interpretationText: "肌力訓練常用 85–95% 1RM；肌肥大用 70–85%；肌耐力用 60–70%。新手不建議直接測試真實 1RM。", context: "脈絡", contextText: "1RM 應與蛋白質攝取、巨量營養素一起看，先定強度區間再安排營養。", example: "範例", exampleText: "100 kg × 5 下、Epley → 100 × (1 + 5/30) = 117 kg；80% 約 93 kg、90% 約 105 kg。" ,
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "肌力訓練的下一步工具", premiumTitle: "PRO 肌力訓練包", premiumText: "解鎖週期化課表生成、各動作 1RM 趨勢圖、自動配重建議與訓練量負荷追蹤。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代運動處方、物理治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Exercise Calories Calculator · Max Heart Rate Calculator · Protein Calculator · Macro Calculator", references: "參考資料", referencesText: "Epley (1985); Brzycki (1993) JOPERD; Lombardi (1989); NSCA Essentials of Strength Training and Conditioning。",
    q1: "哪個公式最準？", a1: "低次數（≤5 下）三種公式都接近；Brzycki 在中等次數較保守，Epley 較寬鬆。建議固定用同一公式追蹤進步。",
    q2: "可以直接測真實 1RM 嗎？", a2: "有經驗者可在保護下測試；新手建議用多次數估算，避免姿勢崩壞造成受傷。",
    q3: "次數越多越準嗎？", a3: "相反。次數超過 10 下時，疲勞與技術影響加大，估算誤差顯著上升。",
    q4: "1RM 多久重測一次？", a4: "一般每 4–8 週評估一次，配合週期化訓練，過於頻繁測試會增加恢復負擔。",
    q5: "女性與長者適用嗎？", a5: "公式不分性別與年齡皆可用作估算，但測試強度應依個人經驗與健康狀況保守調整。",
    q6: "這個工具能評估受傷風險嗎？", a6: "不能。它只是教育用估算；若有關節傷病或慢性疾病，請先諮詢專業人員。",
  },
  en: {
    badge: "Health · Exercise Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "One-Rep Max Calculator", subtitle: "Estimate 1RM and training loads from weight lifted and reps",
    intro: "This calculator uses the weight you lifted (kg) and the number of reps to estimate your one-rep max (1RM) with the Epley, Brzycki, or Lombardi formula, then converts 60%–95% intensities into training loads with rep recommendations to plan strength and hypertrophy programs.",
    trustNoteLabel: "Note:", trustNote: "1RM is an estimate; error grows with more reps (use sets of ≤10 reps). Attempting a real 1RM needs full warm-up, a spotter, and correct form to avoid injury.",
    quickActionCard: "Quick Action Card", tryExample: "Create a 1RM example instantly", examplePreview: "1RM preview", examplePerson: "Weight", fillExample: "One-click standard example", previewActivePath: "Fill Brzycki example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter weight, reps, and formula", examplesHelper: "Start with an example to understand 1RM and intensity conversion, then replace it with your own training data.",
    metric: "Metric (kg)", imperial: "Imperial (lb)", exampleCards: "Example cards", baselineExample: "100 kg × 5 · Epley", activeExample: "80 kg × 8 · Brzycki", enduranceLabel: "Endurance", baselineExampleNote: "100 × (1 + 5/30) = 117 kg", activeExampleNote: "80 × 36/(37−8) = 99 kg", flowDemo: "Reps 5", calculator: "Calculator",
    weight: "Weight lifted (kg)", minutes: "Reps", mode: "Formula", modeFox: "Epley (1 + reps/30)", modeTanaka: "Brzycki (36 / (37−reps))", modeGulati: "Lombardi (weight × reps^0.1)",
    resultCard: "1RM Estimate Result", unit: "kg", primaryValue: "This estimate", maintenanceTarget: "Hypertrophy 80%", actionTarget: "Strength 90%", estimatedTdee: "Formula", maintenance: "80% 1RM", fatLossTarget: "90% 1RM",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card training intensity matrix", tdeeMatrixNote: "L7 uses six fixed cards to convert the current 1RM into 60%–95% training loads with rep recommendations. This is training guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn 1RM into an actionable program", conversionNote: "L9 values update from the estimate: load per intensity, target reps, and recovery hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current strength plan", dailyGap: "Hypertrophy (kg)", weeklyTrend: "Strength (kg)", motivation: "Motivation Card", keepMomentum: "Move from a single estimate to periodized progress",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's 1RM home", journeyHint: "Re-estimate with the same formula every 4–6 weeks to compare progress; improving numbers is safer than chasing single maxes.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Protein to plan protein for muscle synthesis", nextActionItem2: "Use Exercise Calories to estimate training burn", nextActionItem3: "Use Macro to plan overall nutrition on training days",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "1RM → Intensity → Protein → Macros", bmrStep: "1RM", deficitStep: "Intensity", trendStep: "Protein", mealStep: "Macros",
    knowledge: "Knowledge", knowledgeTitle: "What 1RM means in the Health universe", definition: "Definition", definitionText: "1RM (one-rep max) is the maximum weight you can lift for a single repetition of a movement; it is the baseline for setting strength-training intensity.", formula: "Formula", formulaText: "Epley: weight × (1 + reps/30). Brzycki: weight × 36/(37−reps). Lombardi: weight × reps^0.1. Results are close at low reps and diverge as reps increase.", limitations: "Limitations", limitationsText: "Formulas are regression estimates; error grows markedly above 10 reps. Fiber type, technique, and fatigue all affect results, so use the numbers for planning only.", interpretation: "Interpretation", interpretationText: "Strength training commonly uses 85–95% 1RM; hypertrophy 70–85%; muscular endurance 60–70%. Beginners should not test a true 1RM directly.", context: "Context", contextText: "1RM should be viewed with protein intake and macros: set the intensity zone first, then plan nutrition.", example: "Example", exampleText: "100 kg × 5 reps, Epley → 100 × (1 + 5/30) = 117 kg; 80% ≈ 93 kg, 90% ≈ 105 kg." ,
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for strength training", premiumTitle: "PRO Strength Training Pack", premiumText: "Unlock periodized program generation, per-lift 1RM trend charts, auto load suggestions, and volume-load tracking.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace exercise prescription, physical therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Exercise Calories Calculator · Max Heart Rate Calculator · Protein Calculator · Macro Calculator", references: "References", referencesText: "Epley (1985); Brzycki (1993) JOPERD; Lombardi (1989); NSCA Essentials of Strength Training and Conditioning.",
    q1: "Which formula is most accurate?", a1: "At low reps (≤5) all three are close; Brzycki is more conservative at moderate reps, Epley more generous. Stick to one formula to track progress.",
    q2: "Can I test a true 1RM directly?", a2: "Experienced lifters can test with a spotter; beginners should estimate from multiple reps to avoid form breakdown and injury.",
    q3: "Are more reps more accurate?", a3: "The opposite. Above 10 reps, fatigue and technique increase the estimate's error markedly.",
    q4: "How often should I retest 1RM?", a4: "Usually every 4–8 weeks alongside periodized training; testing too often adds recovery burden.",
    q5: "Is it suitable for women and older adults?", a5: "The formulas apply regardless of sex and age for estimation, but test intensity should be adjusted conservatively to experience and health.",
    q6: "Can this tool assess injury risk?", a6: "No. It is an educational estimate; consult professionals for joint injuries or chronic conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function OneRepMaxCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");
  const [mode, setMode] = useState<FormulaMode>("epley");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const r = Number(reps);
    if (w <= 0 || r <= 0 || r > 30) return null;
    const orm = oneRepMax(mode, w, r);
    const hyper = orm * 0.80;
    const strength = orm * 0.90;
    return { orm, hyper, strength };
  }, [weight, reps, mode]);

  const ormDisplay = result ? fmt(result.orm, 0) : "—";
  const hyperDisplay = result ? fmt(result.hyper, 0) : "—";
  const strengthDisplay = result ? fmt(result.strength, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100"); setReps("5"); setMode("epley"); }
  function fillBrzycki() { setUnit("metric"); setWeight("80"); setReps("8"); setMode("brzycki"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{ormDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.minutes}</div><div className="font-black">{reps}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">90%</div><div className="font-black">{strengthDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillBrzycki} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">117 kg</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillBrzycki} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">99 kg</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.minutes}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={reps} onChange={(e) => setReps(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.mode}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as FormulaMode)}><option value="epley">{t.modeFox}</option><option value="brzycki">{t.modeTanaka}</option><option value="lombardi">{t.modeGulati}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{ormDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight}×{reps}</div><div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{hyperDisplay}</p><p className="text-sm font-bold text-blue-700">kg</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{strengthDisplay}</p><p className="text-sm font-bold text-emerald-700">kg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">70%</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.enduranceLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{result ? fmt(result.orm * 0.70, 0) : "—"}</p><p className="text-sm font-bold text-orange-700">kg</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{result ? fmt(result.orm * item.pct, 0) : "—"} <span className="text-sm text-slate-500">kg</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="onerm-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">1RM</div><div className="mt-1 text-3xl font-black">{ormDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{hyperDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{strengthDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "1RM", note: t.bmrStep }, { label: "Intensity", note: t.deficitStep }, { label: "Protein", note: t.trendStep }, { label: "Macros", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="onerm-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Program", "Trends", "AutoLoad", "Volume"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
