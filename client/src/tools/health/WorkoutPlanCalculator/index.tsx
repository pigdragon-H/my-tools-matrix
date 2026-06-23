// @profile B
// Profile B · Calculator-YMYL · WorkoutPlanCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Goal = "muscle" | "fatloss" | "maintain";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const goalSetsPerMuscle: Record<Goal, number> = { muscle: 16, fatloss: 12, maintain: 8 };
const MAJOR_MUSCLE_GROUPS = 6;

const bands = [
  { key: "minimal", max: 6, label: { zh: "極低量", en: "Minimal" }, range: "≤ 6", desc: { zh: "每肌群週組數偏低，較適合維持或復健期。", en: "Low weekly sets per muscle; best for maintenance or rehab phases." } },
  { key: "light", max: 10, label: { zh: "輕量", en: "Light" }, range: "7–10", desc: { zh: "初學者起步區間，先建立動作品質再加量。", en: "Beginner starting zone; build movement quality before adding volume." } },
  { key: "moderate", max: 14, label: { zh: "中量", en: "Moderate" }, range: "11–14", desc: { zh: "多數人增肌的甜蜜點，恢復與刺激平衡。", en: "Hypertrophy sweet spot for most; balances stimulus and recovery." } },
  { key: "high", max: 20, label: { zh: "高量", en: "High" }, range: "15–20", desc: { zh: "進階訓練量，需充足睡眠與營養支持恢復。", en: "Advanced volume; needs solid sleep and nutrition to recover." } },
  { key: "veryhigh", max: 26, label: { zh: "極高量", en: "Very high" }, range: "21–26", desc: { zh: "接近恢復上限，建議週期化並監測疲勞。", en: "Near recovery ceiling; periodize and monitor fatigue." } },
  { key: "excess", max: Infinity, label: { zh: "超量風險", en: "Overreaching" }, range: "26+", desc: { zh: "超過多數人恢復能力，受傷與停滯風險升高。", en: "Beyond most lifters' recovery; injury and stall risk rises." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "可調式啞鈴組", en: "Adjustable Dumbbell Set" }, href: "https://www.amazon.com/s?k=adjustable+dumbbell" },
  { label: { zh: "訓練日誌 App", en: "Training Log App" }, href: "https://www.amazon.com/s?k=workout+log+app" },
  { label: { zh: "彈力帶套組", en: "Resistance Band Set" }, href: "https://www.amazon.com/s?k=resistance+bands" },
  { label: { zh: "乳清蛋白", en: "Whey Protein" }, href: "https://www.amazon.com/s?k=whey+protein" },
];

function pickSplit(days: number, lang: Lang): string {
  const z = lang === "zh";
  if (days <= 2) return z ? "全身訓練 ×2（每次涵蓋所有大肌群）" : "Full-body ×2 (hit all major groups each session)";
  if (days === 3) return z ? "推/拉/腿 三分割" : "Push / Pull / Legs split";
  if (days === 4) return z ? "上半身/下半身 ×2" : "Upper / Lower ×2";
  if (days === 5) return z ? "推/拉/腿 + 上/下" : "Push / Pull / Legs + Upper / Lower";
  return z ? "推/拉/腿 ×2（6 分割）" : "Push / Pull / Legs ×2 (6-day split)";
}

const ui = {
  zh: {
    badge: "健身 · 訓練計畫 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "健身計畫計算機 · Workout Planner", subtitle: "用訓練目標、每週天數與經驗倍率估算每肌群週組數",
    intro: "Workout Plan Calculator 依訓練目標、每週天數與經驗倍率，估算每肌群每週建議組數、總訓練量與分割建議，幫您把課表量化。",
    trustNoteLabel: "注意事項：", trustNote: "訓練量建議為族群平均，實際應依恢復、睡眠與飲食微調，循序漸進避免受傷。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立訓練量範例", examplePreview: "每肌群週組數預覽", examplePerson: "訓練目標", fillExample: "一鍵填入標準範例", previewActivePath: "填入減脂範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入目標、天數與經驗", examplesHelper: "先用範例理解算法，再換成您自己的目標與可訓練天數。",
    metric: "增肌起點", imperial: "維持起點", exampleCards: "範例卡", baselineExample: "增肌 · 4 天 · 中階", activeExample: "減脂 · 3 天 · 入門", flowDemo: "每週天數", calculator: "計算機",
    weight: "每週訓練天數", tdee: "經驗倍率（0.6 新手 ~ 1.2 進階）", goal: "訓練目標", goalCut: "增肌", goalMaintain: "減脂", goalBulk: "維持",
    resultCard: "您的訓練計畫結果", unit: "組/肌群/週", primaryValue: "目前設定", maintenanceTarget: "全身週總組數", actionTarget: "每次訓練約", estimatedTdee: "每肌群週組數", maintenance: "週總組數", fatLossTarget: "每次組數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格訓練量判讀矩陣", tdeeMatrixNote: "L7 用六格強度帶，將目前每肌群週組數放進常見訓練量區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把訓練量轉成可執行課表", conversionNote: "L9 會連動目前計算結果，顯示每次分配、分割建議與漸進負荷提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前訓練規劃", dailyGap: "每次訓練", weeklyTrend: "建議分割", motivation: "動力卡", keepMomentum: "從訓練量走向穩定漸進",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的課表量化帶回家", journeyHint: "用 4–8 週為單位觀察進步，必要時安排減量週，避免單週疲勞誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 TDEE 確認熱量是否支持訓練量", nextActionItem2: "用 Protein 計算搭配訓練量的蛋白質需求", nextActionItem3: "用 Body Fat 或 Macro 檢查飲食是否需調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "目標 → 訓練量 → 分割 → 漸進負荷", bmrStep: "目標", deficitStep: "訓練量", trendStep: "分割", mealStep: "漸進",
    knowledge: "知識", knowledgeTitle: "訓練量在健身宇宙中的意義", definition: "定義", definitionText: "有效訓練量指每肌群每週完成的有效組數，是肌肥大與力量進步的核心驅動之一。", formula: "公式", formulaText: "每肌群週組數 = 目標基準 × 經驗倍率（增肌 16、減脂 12、維持 8）。全身週總 = 每肌群 × 6 大肌群。每次組數 = 週總 ÷ 訓練天數。", limitations: "限制", limitationsText: "基準為族群平均；個體恢復、睡眠與營養差異大。受傷、初學或回歸者應從低量起步並循序漸進。", interpretation: "解讀", interpretationText: "增肌多數研究落在 10–20 有效組，維持約 6–10 組；超過恢復能力會提高停滯與受傷風險。", context: "脈絡", contextText: "訓練量規劃應與 TDEE、蛋白質與恢復一起看，先估每週量，再排分割與飲食。", example: "範例", exampleText: "增肌、每週 4 天、倍率 1.0 → 每肌群 16 組、全身 96 組、每次約 24 組，建議上/下分割 ×2。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "訓練規劃的下一步裝備", premiumTitle: "PRO 週期化課表包", premiumText: "解鎖 4 週漸進式課表、減量週安排、動作清單匯出與訓練量趨勢圖。", feat1: "訓練計畫", feat2: "減量週", feat3: "匯出", feat4: "趨勢",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具以運動科學常見的『每肌群每週有效組數』框架估算，僅供教育與規劃用途，不取代個人化處方。", relatedTools: "相關工具", relatedToolsText: "TDEE Calculator · Protein Calculator · Body Fat Calculator · Macro Calculator", references: "參考資料", referencesText: "Schoenfeld 等人訓練量統合分析；ACSM 阻力訓練指引；NSCA 肌力與體能基礎。",
    q1: "每肌群一週要練幾組？", a1: "增肌多數研究落在 10–20 有效組，維持約 6–10 組。本工具依目標與經驗倍率給出建議值。",
    q2: "分割怎麼選？", a2: "天數少用全身，3 天推拉腿，4 天上下分割，5–6 天可混合。重點是每肌群每週被刺激 ≥2 次。",
    q3: "如何漸進負荷？", a3: "在同樣組數下，每週嘗試多 1–2 次或加一點重量；停滯時再考慮加組或換動作。",
    q4: "需要 deload 嗎？", a4: "高量訓練建議每 4–8 週安排一週減量（組數或強度降約 40%）以利恢復與長期進步。",
    q5: "新手該從多少量開始？", a5: "新手建議經驗倍率 0.6–0.8，從輕量帶起步，先建立動作品質與規律性再逐步加量。",
    q6: "這個工具能當醫療或復健處方嗎？", a6: "不能。它只是教育用估算；有傷病、術後或特殊狀況請諮詢專業教練或物理治療師。",
  },
  en: {
    badge: "Fitness · Training Plan · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Workout Plan Calculator · Workout Planner", subtitle: "Estimate weekly sets per muscle from goal, days, and experience",
    intro: "This calculator uses training goal, weekly days, and an experience multiplier to estimate recommended weekly sets per muscle, total volume, and a split suggestion to quantify your program.",
    trustNoteLabel: "Note:", trustNote: "Volume targets are population averages; adjust to your recovery, sleep, and nutrition, and progress gradually to avoid injury.",
    quickActionCard: "Quick Action Card", tryExample: "Create a volume example instantly", examplePreview: "Weekly sets per muscle preview", examplePerson: "Training goal", fillExample: "One-click standard example", previewActivePath: "Fill fat-loss example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter goal, days, and experience", examplesHelper: "Start with an example to understand the math, then swap in your own goal and trainable days.",
    metric: "Build start", imperial: "Maintain start", exampleCards: "Example cards", baselineExample: "Muscle · 4 days · Intermediate", activeExample: "Fat loss · 3 days · Beginner", flowDemo: "Days/week", calculator: "Calculator",
    weight: "Training days per week", tdee: "Experience multiplier (0.6 novice ~ 1.2 advanced)", goal: "Training goal", goalCut: "Build muscle", goalMaintain: "Fat loss", goalBulk: "Maintain",
    resultCard: "Your training plan", unit: "sets/muscle/week", primaryValue: "Current setup", maintenanceTarget: "Total weekly sets", actionTarget: "Per session approx.", estimatedTdee: "Sets / muscle / week", maintenance: "Weekly total", fatLossTarget: "Per session",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card volume interpretation matrix", tdeeMatrixNote: "L7 uses six intensity bands to place the current weekly sets per muscle into common volume zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn volume into an actionable program", conversionNote: "L9 values update from the computed result: per-session split, split suggestion, and progressive-overload hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current training plan", dailyGap: "Per session", weeklyTrend: "Suggested split", motivation: "Motivation Card", keepMomentum: "Move from volume to consistent progression",
    saveShareJourney: "Save / Share", journeyTitle: "Take your quantified program home", journeyHint: "Track progress over 4–8 week blocks and schedule a deload when needed, so single-week fatigue doesn't mislead you.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use TDEE to confirm calories support the volume", nextActionItem2: "Use Protein to match protein needs to training volume", nextActionItem3: "Use Body Fat or Macro to decide whether diet needs adjustment",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Goal → Volume → Split → Progressive overload", bmrStep: "Goal", deficitStep: "Volume", trendStep: "Split", mealStep: "Progress",
    knowledge: "Knowledge", knowledgeTitle: "What training volume means in the Health universe", definition: "Definition", definitionText: "Effective volume is the weekly count of effective sets per muscle, a core driver of hypertrophy and strength progress.", formula: "Formula", formulaText: "Weekly sets/muscle = goal base × experience multiplier (muscle 16, fat loss 12, maintain 8). Total = sets/muscle × 6 major groups. Per session = total ÷ training days.", limitations: "Limitations", limitationsText: "Bases are population averages; recovery, sleep, and nutrition vary widely. Injured, beginner, or returning lifters should start low and progress gradually.", interpretation: "Interpretation", interpretationText: "Most hypertrophy research lands at 10–20 effective sets; maintenance ≈6–10. Exceeding recovery raises stall and injury risk.", context: "Context", contextText: "Volume planning should be viewed with TDEE, protein, and recovery: estimate weekly volume first, then plan split and diet.", example: "Example", exampleText: "Muscle, 4 days/week, multiplier 1.0 → 16 sets/muscle, 96 total, ~24 per session, suggested Upper/Lower ×2.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next gear for training planning", premiumTitle: "PRO Periodized Program Pack", premiumText: "Unlock a 4-week progressive program, deload-week scheduling, exercise-list export, and volume trend charts.", feat1: "Program", feat2: "Deload", feat3: "Export", feat4: "Trends",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool estimates using the common 'effective weekly sets per muscle' framework. It is for education and planning only and does not replace a personalized prescription.", relatedTools: "Related Tools", relatedToolsText: "TDEE Calculator · Protein Calculator · Body Fat Calculator · Macro Calculator", references: "References", referencesText: "Schoenfeld et al. volume meta-analyses; ACSM resistance-training guidelines; NSCA Essentials of Strength Training.",
    q1: "How many sets per muscle per week?", a1: "Most hypertrophy research lands at 10–20 effective sets; maintenance ≈6–10. This tool scales by goal and experience.",
    q2: "How do I choose a split?", a2: "Few days → full-body, 3 days → push/pull/legs, 4 days → upper/lower, 5–6 days → a blend. Aim to stimulate each muscle ≥2×/week.",
    q3: "How do I progress?", a3: "At the same set count, add 1–2 reps or a little load each week; when stalled, add a set or change the exercise.",
    q4: "Do I need a deload?", a4: "On high volume, schedule a lighter week every 4–8 weeks (drop sets or intensity ~40%) to aid recovery and long-term progress.",
    q5: "How much volume should a beginner start with?", a5: "Beginners should use a 0.6–0.8 multiplier, starting in the light band to build movement quality and consistency before adding volume.",
    q6: "Can this be a medical or rehab prescription?", a6: "No. It is an educational estimate; for injury, post-surgery, or special conditions, consult a qualified coach or physiotherapist.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function WorkoutPlanCalculator() {
  const { lang, setLang } = useLanguage();
  const [days, setDays] = useState("4");
  const [level, setLevel] = useState("1.0");
  const [goal, setGoal] = useState<Goal>("muscle");
  const t = ui[lang];

  const result = useMemo(() => {
    const d = Math.max(1, Math.min(7, Number(days) || 0));
    const lv = Math.max(0.4, Math.min(1.5, Number(level) || 0));
    if (d <= 0 || lv <= 0) return null;
    const perMuscle = goalSetsPerMuscle[goal] * lv;
    const weeklyTotal = perMuscle * MAJOR_MUSCLE_GROUPS;
    const perSession = weeklyTotal / d;
    return { d, lv, perMuscle, weeklyTotal, perSession };
  }, [days, level, goal]);

  const perMuscleDisplay = result ? fmt(result.perMuscle, 0) : "—";
  const weeklyDisplay = result ? fmt(result.weeklyTotal, 0) : "—";
  const perSessionDisplay = result ? fmt(result.perSession, 0) : "—";
  const splitDisplay = result ? pickSplit(result.d, lang) : "—";

  function fillStandard() { setDays("4"); setLevel("1.0"); setGoal("muscle"); }
  function fillCut() { setDays("3"); setLevel("0.8"); setGoal("fatloss"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{perMuscleDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{goal === "muscle" ? "💪" : goal === "fatloss" ? "🔥" : "⚖️"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{days}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.tdee.split("（")[0]}</div><div className="font-black">{level}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${goal === "muscle" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={fillStandard}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${goal === "maintain" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setGoal("maintain")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">16</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExample}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">12</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExample}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" type="number" min={1} max={7} value={days} onChange={(e) => setDays(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" type="number" step="0.1" min={0.4} max={1.5} value={level} onChange={(e) => setLevel(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}><option value="muscle">{t.goalCut}</option><option value="fatloss">{t.goalMaintain}</option><option value="maintain">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{perMuscleDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{days} d / wk</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{weeklyDisplay}</p><p className="text-sm font-bold text-blue-700">sets</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{perSessionDisplay}</p><p className="text-sm font-bold text-emerald-700">sets</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">SPLIT</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.weeklyTrend}</div><p className="mt-2 text-base font-black leading-5 text-orange-950">{splitDisplay}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-ResultIntelligence */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => { const active = result ? (bands.find((b) => result.perMuscle <= b.max) ?? bands[bands.length - 1]).key === item.key : false; return <div key={item.key} className={`rounded-2xl border p-4 ${active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{perMuscleDisplay} <span className="text-sm text-slate-500">sets</span></p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="workout-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison + L9 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Sets/muscle</div><div className="mt-1 text-3xl font-black">{perMuscleDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{perSessionDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-sm font-black text-emerald-950">{splitDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Goal", note: t.bmrStep }, { label: "Volume", note: t.deficitStep }, { label: "Split", note: t.trendStep }, { label: "Progress", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L15-Affiliate */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer sponsored" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO">{/* L16-PremiumGate */}<article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
