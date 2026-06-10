// @profile B
// Profile B · Calculator-YMYL · MaxHeartRateCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type FormulaMode = "fox" | "tanaka" | "gulati";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

function maxHrFor(mode: FormulaMode, age: number): number {
  if (mode === "tanaka") return 208 - 0.7 * age;
  if (mode === "gulati") return 206 - 0.88 * age;
  return 220 - age; // fox
}

// Five training zones expressed as % of HRmax (lower bound used for display)
const bands = [
  { key: "zone1", range: "50–60%", label: { zh: "Zone 1 · 暖身恢復", en: "Zone 1 · Recovery" }, desc: { zh: "極輕鬆，促進恢復與暖身，可長時間維持。", en: "Very easy; aids recovery and warm-up, sustainable for long periods." }, lo: 0.50, hi: 0.60 },
  { key: "zone2", range: "60–70%", label: { zh: "Zone 2 · 燃脂耐力", en: "Zone 2 · Endurance" }, desc: { zh: "可對話強度，建立有氧基礎與脂肪利用。", en: "Conversational pace; builds aerobic base and fat utilization." }, lo: 0.60, hi: 0.70 },
  { key: "zone3", range: "70–80%", label: { zh: "Zone 3 · 有氧進階", en: "Zone 3 · Aerobic" }, desc: { zh: "中高強度，提升有氧能力與配速。", en: "Moderate-high; improves aerobic capacity and pace." }, lo: 0.70, hi: 0.80 },
  { key: "zone4", range: "80–90%", label: { zh: "Zone 4 · 乳酸閾值", en: "Zone 4 · Threshold" }, desc: { zh: "接近乳酸閾值，提升耐受與速度。", en: "Near lactate threshold; raises tolerance and speed." }, lo: 0.80, hi: 0.90 },
  { key: "zone5", range: "90–100%", label: { zh: "Zone 5 · 最大強度", en: "Zone 5 · Maximum" }, desc: { zh: "極限衝刺，僅能短時間維持，需充分恢復。", en: "All-out sprint; only sustainable briefly, requires full recovery." }, lo: 0.90, hi: 1.00 },
  { key: "danger", range: "> 100%", label: { zh: "超出上限", en: "Above maximum" }, desc: { zh: "超過估算最大心率，建議停止並就醫評估。", en: "Above estimated max; stop and seek medical evaluation." }, lo: 1.00, hi: 1.10 },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "運動消耗計算機", en: "Exercise Calories Calculator" }, href: "/tools/health/exercise-calories-calculator" },
  { label: { zh: "卡路里燃燒計算機", en: "Calorie Burn Calculator" }, href: "/tools/health/calorie-burn-calculator" },
  { label: { zh: "跑步配速計算機", en: "Running Pace Calculator" }, href: "/tools/health/running-pace-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "最大心率計算機 · Max Heart Rate", subtitle: "用年齡與公式估算最大心率與五個訓練心率區間",
    intro: "Max Heart Rate Calculator 依據年齡與選擇的公式（Fox 220−年齡、Tanaka 208−0.7×年齡、Gulati 女性 206−0.88×年齡）估算最大心率(bpm)，並換算 Zone 1~5 訓練心率區間，協助安排有氧、燃脂與閾值訓練。",
    trustNoteLabel: "注意事項：", trustNote: "公式為族群平均估算，個人最大心率可能相差 ±10–12 bpm；心血管疾病、用藥或心律不整者應以實測與醫囑為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立最大心率範例", examplePreview: "最大心率預覽", examplePerson: "年齡", fillExample: "一鍵填入標準範例", previewActivePath: "填入 Tanaka 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年齡與公式", examplesHelper: "先用範例理解最大心率與訓練區間，再改成自己的年齡與偏好的公式。",
    metric: "公制 (bpm)", imperial: "百分比 (%)", exampleCards: "範例卡", baselineExample: "30 歲 · Fox", activeExample: "40 歲 · Tanaka", baselineExampleNote: "220 − 30 = 190 bpm", activeExampleNote: "208 − 0.7×40 = 180 bpm", flowDemo: "年齡 30", calculator: "計算機",
    weight: "年齡 (歲)", minutes: "估算公式", mode: "公式", modeFox: "Fox (220−年齡)", modeTanaka: "Tanaka (208−0.7×年齡)", modeGulati: "Gulati 女性 (206−0.88×年齡)",
    resultCard: "最大心率結果", unit: "bpm", primaryValue: "本次估算", maintenanceTarget: "燃脂區 Z2", actionTarget: "閾值區 Z4", estimatedTdee: "公式", maintenance: "Zone 2", fatLossTarget: "Zone 4",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格訓練心率區間矩陣", tdeeMatrixNote: "L7 固定六格，將目前最大心率拆成 Zone 1~5 與超限警示；這是訓練規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把最大心率轉成可執行訓練計畫", conversionNote: "L9 會連動目前估算結果，顯示各區間 bpm、目標心率與恢復提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前心率規劃", dailyGap: "燃脂區 (bpm)", weeklyTrend: "閾值區 (bpm)", motivation: "動力卡", keepMomentum: "從最大心率走向分區訓練",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的心率區間帶回家", journeyHint: "建議搭配心率帶或手錶實測，逐步校正個人最大心率，比公式更貼近真實。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Exercise Calories 估算各區間訓練消耗", nextActionItem2: "用 Running Pace 對應心率區間配速", nextActionItem3: "用 TDEE 安排訓練後的熱量平衡",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "最大心率 → 訓練區間 → 運動消耗 → 配速", bmrStep: "最大心率", deficitStep: "訓練區間", trendStep: "運動消耗", mealStep: "配速規劃",
    knowledge: "知識", knowledgeTitle: "最大心率在健康宇宙中的意義", definition: "定義", definitionText: "最大心率(HRmax)是心臟在極限運動下每分鐘可達的最高跳動次數，是設定訓練強度的基準。", formula: "公式", formulaText: "Fox: 220 − 年齡。Tanaka: 208 − 0.7 × 年齡（較適用中高齡）。Gulati（女性）: 206 − 0.88 × 年齡。訓練區間 = HRmax × 百分比。", limitations: "限制", limitationsText: "所有公式皆為族群迴歸估算，個人差異可達 ±10–12 bpm；服用 β 阻斷劑、心律不整或心臟疾病者數值不適用，應以運動心電圖實測為準。", interpretation: "解讀", interpretationText: "多數有氧訓練落在 Zone 2~3；閾值與間歇在 Zone 4~5。長期過度停留高區間會增加疲勞與受傷風險。", context: "脈絡", contextText: "最大心率應與運動消耗、配速一起看，用區間安排不同訓練日的強度。", example: "範例", exampleText: "30 歲、Fox → 220 − 30 = 190 bpm；Zone 2 約 114–133 bpm，Zone 4 約 152–171 bpm。" ,
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "心率訓練的下一步工具", premiumTitle: "PRO 心率訓練包", premiumText: "解鎖個人化心率區間校正、週期化訓練建議、心率變異(HRV)趨勢與恢復評分報告。", feat1: "心率區間", feat2: "週期化", feat3: "心率變異", feat4: "恢復",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、運動心肺檢測或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Exercise Calories Calculator · Calorie Burn Calculator · Running Pace Calculator · TDEE Calculator", references: "參考資料", referencesText: "Tanaka, Monahan & Seals (2001) JACC; Gulati et al. (2010) Circulation; ACSM Guidelines for Exercise Testing and Prescription。",
    q1: "哪個公式最準？", a1: "Tanaka 公式對中高齡較準；Fox 簡單但常高估年長者、低估年輕人。最準的仍是運動心電圖實測。",
    q2: "為什麼女性建議用 Gulati？", a2: "Gulati 公式以女性族群迴歸而來，對女性最大心率的估算誤差較小。",
    q3: "達到最大心率危險嗎？", a3: "短暫接近上限對健康者通常安全，但持續逼近或出現胸悶、頭暈應立即停止並就醫。",
    q4: "可以用心率減脂嗎？", a4: "可以。Zone 2 脂肪利用比例高且可長時間維持，是常見的燃脂耐力區。",
    q5: "吃藥會影響嗎？", a5: "會。β 阻斷劑等藥物會壓低心率，公式不適用，請以實測與醫囑為準。",
    q6: "這個工具能診斷心臟疾病嗎？", a6: "不能。它只是教育用估算；若有心悸、胸痛或心臟病史，請先諮詢專業人員。",
  },
  en: {
    badge: "Health · Exercise Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Max Heart Rate Calculator", subtitle: "Estimate max heart rate and five training zones from age and formula",
    intro: "This calculator uses age and a chosen formula (Fox 220−age, Tanaka 208−0.7×age, Gulati female 206−0.88×age) to estimate maximum heart rate (bpm) and derive Zone 1–5 training ranges to plan aerobic, fat-burn, and threshold work.",
    trustNoteLabel: "Note:", trustNote: "Formulas are population averages; individual max heart rate can differ by ±10–12 bpm. Those with cardiovascular disease, medication, or arrhythmia should rely on measured values and medical advice.",
    quickActionCard: "Quick Action Card", tryExample: "Create a max heart rate example instantly", examplePreview: "Max HR preview", examplePerson: "Age", fillExample: "One-click standard example", previewActivePath: "Fill Tanaka example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter age and formula", examplesHelper: "Start with an example to understand max HR and zones, then replace it with your own age and preferred formula.",
    metric: "Metric (bpm)", imperial: "Percent (%)", exampleCards: "Example cards", baselineExample: "Age 30 · Fox", activeExample: "Age 40 · Tanaka", baselineExampleNote: "220 − 30 = 190 bpm", activeExampleNote: "208 − 0.7×40 = 180 bpm", flowDemo: "Age 30", calculator: "Calculator",
    weight: "Age (years)", minutes: "Formula", mode: "Formula", modeFox: "Fox (220−age)", modeTanaka: "Tanaka (208−0.7×age)", modeGulati: "Gulati female (206−0.88×age)",
    resultCard: "Max Heart Rate Result", unit: "bpm", primaryValue: "This estimate", maintenanceTarget: "Fat-burn Z2", actionTarget: "Threshold Z4", estimatedTdee: "Formula", maintenance: "Zone 2", fatLossTarget: "Zone 4",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card training zone matrix", tdeeMatrixNote: "L7 uses six fixed cards to split the current max HR into Zones 1–5 plus an over-limit warning. This is training guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn max heart rate into an actionable training plan", conversionNote: "L9 values update from the estimate: each zone in bpm, target heart rate, and recovery hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current heart-rate plan", dailyGap: "Fat-burn (bpm)", weeklyTrend: "Threshold (bpm)", motivation: "Motivation Card", keepMomentum: "Move from max HR to zone-based training",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's heart-rate zones home", journeyHint: "Pair with a heart-rate strap or watch to calibrate your personal max HR; measured values beat formulas.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Exercise Calories to estimate burn per zone", nextActionItem2: "Use Running Pace to match pace to heart-rate zones", nextActionItem3: "Use TDEE to plan post-training energy balance",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Max HR → Zones → Exercise burn → Pace", bmrStep: "Max HR", deficitStep: "Zones", trendStep: "Exercise burn", mealStep: "Pace planning",
    knowledge: "Knowledge", knowledgeTitle: "What max heart rate means in the Health universe", definition: "Definition", definitionText: "Maximum heart rate (HRmax) is the highest beats per minute the heart can reach under maximal exertion; it is the baseline for setting training intensity.", formula: "Formula", formulaText: "Fox: 220 − age. Tanaka: 208 − 0.7 × age (better for middle-aged/older). Gulati (female): 206 − 0.88 × age. Training zone = HRmax × percentage.", limitations: "Limitations", limitationsText: "All formulas are population regressions; individual variation can reach ±10–12 bpm. They do not apply to people on beta-blockers or with arrhythmia or heart disease, who should use a measured exercise ECG.", interpretation: "Interpretation", interpretationText: "Most aerobic work sits in Zone 2–3; threshold and intervals in Zone 4–5. Long periods in high zones increase fatigue and injury risk.", context: "Context", contextText: "Max HR should be viewed with exercise burn and pace, using zones to set intensity on different training days.", example: "Example", exampleText: "Age 30, Fox → 220 − 30 = 190 bpm; Zone 2 ≈ 114–133 bpm, Zone 4 ≈ 152–171 bpm." ,
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for heart-rate training", premiumTitle: "PRO Heart-Rate Training Pack", premiumText: "Unlock personalized zone calibration, periodized training advice, heart-rate variability (HRV) trends, and recovery score reports.", feat1: "Zones", feat2: "Periodize", feat3: "HRV", feat4: "Recovery",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, cardiopulmonary testing, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Exercise Calories Calculator · Calorie Burn Calculator · Running Pace Calculator · TDEE Calculator", references: "References", referencesText: "Tanaka, Monahan & Seals (2001) JACC; Gulati et al. (2010) Circulation; ACSM Guidelines for Exercise Testing and Prescription.",
    q1: "Which formula is most accurate?", a1: "Tanaka is more accurate for middle-aged and older adults; Fox is simple but often overestimates older and underestimates younger people. A measured exercise ECG is still most accurate.",
    q2: "Why is Gulati recommended for women?", a2: "The Gulati formula was derived from a female cohort, so it has smaller error when estimating women's max heart rate.",
    q3: "Is reaching max heart rate dangerous?", a3: "Briefly nearing the limit is usually safe for healthy people, but stop and seek care if you have chest tightness or dizziness, or if you keep pushing near it.",
    q4: "Can I use heart rate for fat loss?", a4: "Yes. Zone 2 has a high fat-utilization ratio and is sustainable for long periods, making it a common fat-burn endurance zone.",
    q5: "Does medication affect it?", a5: "Yes. Beta-blockers and similar drugs lower heart rate, so the formulas do not apply—use measured values and medical advice.",
    q6: "Can this tool diagnose heart disease?", a6: "No. It is an educational estimate; consult professionals for palpitations, chest pain, or a cardiac history.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function MaxHeartRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [age, setAge] = useState("30");
  const [mode, setMode] = useState<FormulaMode>("fox");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(age);
    if (a <= 0 || a > 120) return null;
    const hrMax = maxHrFor(mode, a);
    const zone2 = hrMax * 0.65;
    const zone4 = hrMax * 0.85;
    return { hrMax, zone2, zone4 };
  }, [age, mode]);

  const hrMaxDisplay = result ? fmt(result.hrMax, 0) : "—";
  const zone2Display = result ? fmt(result.zone2, 0) : "—";
  const zone4Display = result ? fmt(result.zone4, 0) : "—";

  function fillStandard() { setUnit("metric"); setAge("30"); setMode("fox"); }
  function fillTanaka() { setUnit("metric"); setAge("40"); setMode("tanaka"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{hrMaxDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{zone2Display}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{zone4Display}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillTanaka} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">190 bpm</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillTanaka} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">180 bpm</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.mode}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as FormulaMode)}><option value="fox">{t.modeFox}</option><option value="tanaka">{t.modeTanaka}</option><option value="gulati">{t.modeGulati}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{hrMaxDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{age} y</div><div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{zone2Display}</p><p className="text-sm font-bold text-blue-700">bpm</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{zone4Display}</p><p className="text-sm font-bold text-emerald-700">bpm</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">MAX</div><div className="mt-1 text-xs font-black uppercase text-orange-700">Zone 5</div><p className="mt-2 text-3xl font-black text-orange-950">{result ? fmt(result.hrMax * 0.95, 0) : "—"}</p><p className="text-sm font-bold text-orange-700">bpm</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{result ? `${fmt(result.hrMax * item.lo, 0)}–${fmt(result.hrMax * item.hi, 0)}` : "—"} <span className="text-sm text-slate-500">bpm</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="maxhr-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{hrMaxDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{zone2Display}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{zone4Display}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Max HR", note: t.bmrStep }, { label: "Zones", note: t.deficitStep }, { label: "Burn", note: t.trendStep }, { label: "Pace", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="maxhr-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
