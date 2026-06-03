// @profile B
// Profile B · Calculator-YMYL · CalorieDeficitCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type DeficitMode = "deficit" | "maintenance" | "surplus";
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "light", range: "100–250", label: { zh: "輕度赤字", en: "Light deficit" }, desc: { zh: "適合先建立習慣，速度慢但壓力較低。", en: "Good for habit building with lower stress." } },
  { key: "standard", range: "250–500", label: { zh: "標準赤字", en: "Standard deficit" }, desc: { zh: "常見減脂起點，需搭配蛋白質與阻力訓練。", en: "Common fat-loss starting point; pair with protein and strength training." } },
  { key: "aggressive", range: "500–750", label: { zh: "積極赤字", en: "Aggressive deficit" }, desc: { zh: "速度較快，但飢餓與恢復壓力增加。", en: "Faster, but hunger and recovery stress rise." } },
  { key: "extreme", range: ">750", label: { zh: "激進赤字", en: "Very large deficit" }, desc: { zh: "不建議長期自行使用，特殊情況請諮詢專業人員。", en: "Not ideal long term without professional guidance." } },
  { key: "maintain", range: "0", label: { zh: "維持熱量", en: "Maintenance" }, desc: { zh: "攝取接近 TDEE，適合體重穩定與重新估算。", en: "Intake near TDEE, useful for weight stability and recalibration." } },
  { key: "surplus", range: "+250–500", label: { zh: "盈餘", en: "Surplus" }, desc: { zh: "適合增肌或恢復期，但體脂可能上升。", en: "Useful for muscle gain or recovery; fat may increase." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "Macro 計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "體脂率計算機", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 熱量規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "熱量赤字計算機 · Calorie Deficit Planner", subtitle: "用 TDEE 與攝取熱量估算每日赤字與體重趨勢",
    intro: "Calorie Deficit Calculator 用維持熱量 TDEE 減去實際攝取熱量，估算每日與每週熱量差，並用 3500 kcal/lb 與 7700 kcal/kg 提供靜態體重變化參考。",
    trustNoteLabel: "注意事項：", trustNote: "3500 kcal/lb 是簡化估算。長期變化會受代謝適應、活動量、水分、月經週期、睡眠與藥物影響。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立赤字範例", examplePreview: "每日赤字預覽", examplePerson: "標準減脂", fillExample: "一鍵填入標準範例", previewActivePath: "填入維持範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入 TDEE 與攝取熱量", examplesHelper: "先用範例理解每日赤字、每週赤字與靜態體重換算，再改成自己的 TDEE 與平均攝取。",
    metric: "kg 換算", imperial: "lb 換算", exampleCards: "範例卡", baselineExample: "500 kcal 標準赤字", activeExample: "維持熱量示範", flowDemo: "0 deficit", calculator: "計算機",
    tdee: "TDEE 維持熱量（kcal/day）", intake: "每日攝取（kcal/day）", days: "追蹤天數", mode: "目標模式", deficit: "赤字", maintenanceMode: "維持", surplus: "盈餘",
    resultCard: "熱量赤字結果", unit: "kcal/day", primaryValue: "主要數值", maintenanceTarget: "每週熱量差", actionTarget: "靜態體重趨勢", estimatedTdee: "每日赤字", maintenance: "每週赤字", fatLossTarget: "預估變化",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格赤字判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日熱量差放進常見規劃區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把赤字數字轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每日赤字、距離 500 kcal 的差距與週赤字。",
    progressInsight: "進度洞察卡", possibleTarget: "目前赤字品質", dailyGap: "距離500", weeklyTrend: "每週差額", motivation: "動力卡", keepMomentum: "從熱量差走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的赤字估算帶回家", journeyHint: "用 7–14 天平均攝取重新比較，避免被單日水分與鈉攝取誤導。", nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 TDEE 確認維持熱量是否合理", nextActionItem2: "用 Macro 設定蛋白質、碳水與脂肪", nextActionItem3: "用 Body Fat 或體重趨勢檢查是否需要調整赤字", shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "BMR / TDEE / Macro → Calorie Deficit → Weight Trend / Body Fat / Meal Planning", bmrStep: "BMR/TDEE", deficitStep: "熱量赤字", trendStep: "體重趨勢", mealStep: "餐飲規劃",
    knowledge: "知識", knowledgeTitle: "Calorie deficit 在健康宇宙中的意義", definition: "定義", definitionText: "熱量赤字是每日總消耗 TDEE 高於每日攝取熱量時的差額。", formula: "公式", formulaText: "每日赤字 = TDEE − 攝取熱量。每週赤字 = 每日赤字 × 7。靜態換算：每週體重變化約 = 每週赤字 ÷ 3500 kcal/lb，或 ÷ 7700 kcal/kg。", limitations: "限制", limitationsText: "3500 kcal/lb 模型不會完整反映長期代謝適應、NEAT 下降、活動改變與水分波動。", interpretation: "解讀", interpretationText: "250–500 kcal/day 通常較容易長期維持；超過 750 kcal/day 需要更謹慎。", context: "脈絡", contextText: "赤字需接在 TDEE 之後，並與蛋白質、訓練、睡眠和壓力管理一起看。", example: "範例", exampleText: "TDEE 2400、攝取 1900 → 每日赤字 500、每週 3500，靜態估算約每週 1.0 lb 或 0.45 kg。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "熱量規劃的下一步工具", premiumTitle: "PRO 熱量赤字追蹤包", premiumText: "解鎖 TDEE 連動、週平均攝取、動態體重趨勢與個人化赤字報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMR Calculator · TDEE Calculator · Macro Calculator · Body Fat Calculator", references: "參考資料", referencesText: "CDC Steps for Losing Weight；NIH News in Health Healthy Weight Control；Hall et al. dynamic weight-loss modeling via NIH/PMC；Mifflin-St Jeor equation original citation。",
    q1: "什麼是 calorie deficit？", a1: "Calorie deficit 是攝取熱量低於維持熱量 TDEE 時的每日熱量差。",
    q2: "每天少 500 kcal 一定會每週少一磅嗎？", a2: "不一定。3500 kcal/lb 是靜態估算，長期會受代謝適應、水分與活動量影響。",
    q3: "TDEE 和攝取熱量哪個更重要？", a3: "兩者都重要；赤字本身等於 TDEE 減攝取，所以任一估錯都會影響結果。",
    q4: "赤字太大有什麼風險？", a4: "過大赤字可能提高飢餓、疲勞、訓練恢復差與營養不足風險。",
    q5: "運動消耗要不要全部吃回來？", a5: "不一定。穿戴裝置可能高估消耗，建議看週平均體重與恢復狀態再調整。",
    q6: "這個工具能診斷肥胖或飲食失調嗎？", a6: "不能。它只是教育用估算；若有疾病、懷孕、飲食失調風險或用藥，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Calorie Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Calorie Deficit Calculator · Weight Trend Planner", subtitle: "Estimate daily deficit and weight trend from TDEE and intake",
    intro: "This calculator subtracts average daily intake from maintenance calories (TDEE), estimates daily and weekly calorie balance, and shows a static trend using 3500 kcal/lb or 7700 kcal/kg.",
    trustNoteLabel: "Note:", trustNote: "The 3500 kcal/lb rule is a simplified estimate. Long-term change is affected by metabolic adaptation, activity, water, menstrual cycle, sleep, and medication.",
    quickActionCard: "Quick Action Card", tryExample: "Create a deficit example instantly", examplePreview: "Daily deficit preview", examplePerson: "Standard cut", fillExample: "One-click deficit example", previewActivePath: "Fill maintenance example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter TDEE and calorie intake", examplesHelper: "Start with an example to understand daily deficit, weekly deficit, and static weight conversion, then replace it with your own TDEE and average intake.",
    metric: "kg conversion", imperial: "lb conversion", exampleCards: "Example cards", baselineExample: "500 kcal standard deficit", activeExample: "Maintenance demo", flowDemo: "0 deficit", calculator: "Calculator",
    tdee: "TDEE maintenance (kcal/day)", intake: "Daily intake (kcal/day)", days: "Tracking days", mode: "Goal mode", deficit: "Deficit", maintenanceMode: "Maintenance", surplus: "Surplus",
    resultCard: "Calorie Deficit Result", unit: "kcal/day", primaryValue: "Primary Value", maintenanceTarget: "Weekly calorie balance", actionTarget: "Static weight trend", estimatedTdee: "Daily deficit", maintenance: "Weekly deficit", fatLossTarget: "Estimated change",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card deficit interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to compare the current daily balance with common planning zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn calorie balance into an actionable plan", conversionNote: "L9 values update from the computed result: daily deficit, gap from 500 kcal, and weekly balance.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current deficit quality", dailyGap: "Gap to 500", weeklyTrend: "Weekly balance", motivation: "Motivation Card", keepMomentum: "Move from calorie balance to consistent tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's deficit estimate home", journeyHint: "Compare again using 7–14 day average intake to avoid overreacting to single-day water or sodium changes.", nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm maintenance calories with TDEE", nextActionItem2: "Use Macro Calculator to set protein, carbs, and fat", nextActionItem3: "Use Body Fat or weight trend to decide whether the deficit needs adjustment", shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "BMR / TDEE / Macro → Calorie Deficit → Weight Trend / Body Fat / Meal Planning", bmrStep: "BMR/TDEE", deficitStep: "Calorie deficit", trendStep: "Weight trend", mealStep: "Meal planning",
    knowledge: "Knowledge", knowledgeTitle: "What calorie deficit means in the Health universe", definition: "Definition", definitionText: "A calorie deficit is the gap when total daily energy expenditure is higher than calorie intake.", formula: "Formula", formulaText: "Daily deficit = TDEE − intake. Weekly deficit = daily deficit × 7. Static conversion: weekly weight change ≈ weekly deficit ÷ 3500 kcal/lb or ÷ 7700 kcal/kg.", limitations: "Limitations", limitationsText: "The 3500 kcal/lb model does not fully reflect long-term metabolic adaptation, NEAT decline, activity changes, or water shifts.", interpretation: "Interpretation", interpretationText: "250–500 kcal/day is often more sustainable; above 750 kcal/day deserves extra caution.", context: "Context", contextText: "Deficit planning should follow TDEE and be paired with protein, training, sleep, and stress management.", example: "Example", exampleText: "TDEE 2400 and intake 1900 → daily deficit 500, weekly deficit 3500, static estimate about 1.0 lb or 0.45 kg per week.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for calorie planning", premiumTitle: "PRO Calorie Deficit Tracking Pack", premiumText: "Unlock TDEE linking, weekly average intake, dynamic weight trend, and personalized deficit reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMR Calculator · TDEE Calculator · Macro Calculator · Body Fat Calculator", references: "References", referencesText: "CDC Steps for Losing Weight; NIH News in Health Healthy Weight Control; Hall et al. dynamic weight-loss modeling via NIH/PMC; Mifflin-St Jeor equation original citation.",
    q1: "What is a calorie deficit?", a1: "A calorie deficit is the daily gap when calorie intake is lower than maintenance calories or TDEE.",
    q2: "Does eating 500 kcal less always mean one pound per week?", a2: "Not always. The 3500 kcal/lb rule is static; long-term change is affected by adaptation, water, and activity.",
    q3: "Which matters more: TDEE or intake?", a3: "Both matter because the deficit equals TDEE minus intake; error in either estimate changes the result.",
    q4: "What are the risks of a very large deficit?", a4: "Large deficits may increase hunger, fatigue, poor training recovery, and nutrition inadequacy risk.",
    q5: "Should I eat back all exercise calories?", a5: "Not necessarily. Wearables may overestimate burn; use weekly weight trend and recovery to adjust.",
    q6: "Can this tool diagnose obesity or eating disorders?", a6: "No. It is an educational estimate; consult professionals for disease, pregnancy, eating-disorder risk, or medication concerns.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function modeFromBalance(v: number): DeficitMode {
  if (v > 50) return "deficit";
  if (v < -50) return "surplus";
  return "maintenance";
}

export default function CalorieDeficitCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"kg" | "lb">("lb");
  const [tdee, setTdee] = useState("2400");
  const [intake, setIntake] = useState("1900");
  const [days, setDays] = useState("7");
  const t = ui[lang];

  const result = useMemo(() => {
    const tdeeValue = Number(tdee);
    const intakeValue = Number(intake);
    const dayValue = Math.max(1, Number(days) || 7);
    if (tdeeValue <= 0 || intakeValue <= 0) return null;
    const dailyDeficit = tdeeValue - intakeValue;
    const weeklyDeficit = dailyDeficit * 7;
    const periodDeficit = dailyDeficit * dayValue;
    const pounds = weeklyDeficit / 3500;
    const kg = weeklyDeficit / 7700;
    const displayWeight = unit === "lb" ? pounds : kg;
    return { dailyDeficit, weeklyDeficit, periodDeficit, displayWeight, mode: modeFromBalance(dailyDeficit), gap500: dailyDeficit - 500 };
  }, [days, intake, tdee, unit]);

  const dailyDisplay = result ? fmt(result.dailyDeficit) : "—";
  const weeklyDisplay = result ? fmt(result.weeklyDeficit) : "—";
  const weightDisplay = result ? fmt(result.displayWeight, 2) : "—";

  function fillDeficit() { setUnit("lb"); setTdee("2400"); setIntake("1900"); setDays("7"); }
  function fillMaintenance() { setUnit("kg"); setTdee("2200"); setIntake("2200"); setDays("14"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{dailyDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result?.mode === "deficit" ? t.deficit : result?.mode === "surplus" ? t.surplus : t.maintenanceMode}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">TDEE</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">Intake</div><div className="font-black">{intake}</div></div></div><button onClick={fillDeficit} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillMaintenance} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "kg" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("kg")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "lb" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("lb")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillDeficit} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">500</span></div><p className="mt-2 text-sm text-slate-600">TDEE 2400 · intake 1900 · 7 days</p></button><button onClick={fillMaintenance} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">TDEE 2200 · intake 2200 · 14 days</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.intake}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={intake} onChange={(e) => setIntake(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.days}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={days} onChange={(e) => setDays(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.mode}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={result?.mode ?? "deficit"} disabled><option value="deficit">{t.deficit}</option><option value="maintenance">{t.maintenanceMode}</option><option value="surplus">{t.surplus}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{dailyDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.mode}</div><div className="mt-1 text-xl font-black">{result?.mode === "deficit" ? t.deficit : result?.mode === "surplus" ? t.surplus : t.maintenanceMode}</div><div className="mt-1 text-xs text-slate-300">TDEE − intake</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-blue-950">{dailyDisplay}</p><p className="text-sm font-bold text-blue-700">kcal</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">{weeklyDisplay}</p><p className="text-sm font-bold text-emerald-700">kcal/week</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-orange-950">{weightDisplay}</p><p className="text-sm font-bold text-orange-700">{unit}/week</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{dailyDisplay} <span className="text-sm text-slate-500">kcal/day</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="calorie-deficit-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Daily</div><div className="mt-1 text-3xl font-black">{dailyDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.gap500) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{weeklyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMR/TDEE", note: t.bmrStep }, { label: "Deficit", note: t.deficitStep }, { label: "Trend", note: t.trendStep }, { label: "Meal", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="calorie-deficit-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["TDEE", "Intake", "Trend", "Reports"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
