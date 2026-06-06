// @profile B
// Profile B · Calculator-Travel · TravelHydrationCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "light" | "standard" | "intense";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 1.5 L", label: { zh: "極少", en: "Very Low" }, desc: { zh: "需水量極少，多為短程低活動，仍應規律小口補水。", en: "Very low need—short low-activity trips, still sip regularly." } },
  { key: "low", range: "1.5–2 L", label: { zh: "低", en: "Low" }, desc: { zh: "需水偏低，留意室內外溫差與咖啡因利尿即可。", en: "Low need; mind indoor-outdoor temperature gaps and caffeine diuresis." } },
  { key: "healthy", range: "2–3 L", label: { zh: "中等", en: "Moderate" }, desc: { zh: "常見旅遊補水區間，搭配電解質維持精神與專注。", en: "Common travel band; add electrolytes to keep energy and focus." } },
  { key: "good", range: "3–4 L", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "需水偏高，戶外活動多時務必定時補水避免脫水。", en: "Elevated need; with much outdoor activity, hydrate on schedule to avoid dehydration." } },
  { key: "strong", range: "4–5 L", label: { zh: "高", en: "High" }, desc: { zh: "高溫或高強度行程需大量補水，並補充鈉鉀電解質。", en: "Hot or intense trips need lots of water plus sodium-potassium electrolytes." } },
  { key: "elite", range: "> 5 L", label: { zh: "極高", en: "Severe" }, desc: { zh: "極端條件需水極高，分次補充避免一次過量並監測尿色。", en: "Extreme conditions need very high intake; split it, avoid overload, and watch urine color." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "防曬係數計算機", en: "SPF Calculator" }, href: "/tools/travel/spf-calculator" },
  { label: { zh: "高山症風險計算機", en: "Altitude Sickness Calculator" }, href: "/tools/travel/altitude-sickness-calculator" },
  { label: { zh: "時差調適計算機", en: "Jet Lag Calculator" }, href: "/tools/travel/jet-lag-calculator" },
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 補水 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "旅遊補水計算機 · Hydration", subtitle: "用體重、戶外活動時數與活動強度算出每日建議補水量與活動加成占比",
    intro: "Travel Hydration Calculator 依據體重、戶外活動時數與活動強度（輕度、標準或高強度），計算每日基礎補水量、活動加成水量與總補水量，協助你判斷高溫或長時間戶外行程該補多少水、何時加電解質、如何分次補充避免脫水或一次過量，讓旅途保持精神與健康。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以體重與活動強度估算，未含氣溫、濕度、海拔與個人疾病；實際補水量請依口渴、尿色與身體狀況彈性調整。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立補水範例", examplePreview: "補水預覽", examplePerson: "體重", fillExample: "一鍵填入標準強度範例", previewActivePath: "填入高強度範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入體重、戶外活動時數與活動強度", examplesHelper: "先用範例理解體重與活動強度如何決定每日補水量與活動加成占比，再改成自己的行程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準強度模式", activeExample: "高強度示範", baselineExampleNote: "體重 65 · 時數 6 · 標準", activeExampleNote: "體重 65 · 時數 6 · 高強度", carbsLabel: "活動加成占比", carbsName: "%", proteinLabel: "活動加成占比", flowDemo: "活動時數", calculator: "計算機",
    weight: "體重 (公斤)", tdee: "戶外活動時數 (小時)", goal: "活動強度", goalCut: "輕度 (30ml/kg)", goalMaintain: "標準 (40ml/kg)", goalBulk: "高強度 (55ml/kg)",
    resultCard: "旅遊補水結果", unit: "公升 (每日補水)", primaryValue: "主要數值", maintenanceTarget: "活動加成水量", actionTarget: "每日補水", estimatedTdee: "活動時數", maintenance: "毫升", fatLossTarget: "公升",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格每日補水量判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日補水量放進常見區間；這是規劃參考，不是醫療結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把補水結果轉成可執行的行程策略", conversionNote: "L9 會連動目前計算結果，顯示活動加成占比、每日補水與時數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前補水概況", dailyGap: "活動加成占比", weeklyTrend: "每日補水", motivation: "動力卡", keepMomentum: "從補水分析走向有精神不脫水的行程節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的補水結果帶回團隊", journeyHint: "用防曬係數計算機一起看，把每日補水與補擦頻率一併納入戶外規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用防曬係數計算機規劃戶外防護", nextActionItem2: "用高山症風險計算機評估高海拔需水", nextActionItem3: "用旅遊預算把飲水與電解質納入花費",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "體重 → 加成占比 → 強度 → 時數", bmrStep: "體重", deficitStep: "加成占比", trendStep: "強度", mealStep: "時數",
    knowledge: "知識", knowledgeTitle: "活動強度在旅遊補水中的意義", definition: "定義", definitionText: "旅遊補水評估是把體重依活動強度換算成基礎補水量，再加上戶外活動加成；每日補水量與活動加成占比衡量你的補水需求，是長時間戶外行程維持精神的核心指標。", formula: "公式", formulaText: "基礎補水 = 體重 × 強度係數（ml/kg）。活動加成 = 活動時數 × 200ml。每日補水 = 基礎 + 加成。", limitations: "限制", limitationsText: "本工具以體重與活動強度估算；真實補水量還受氣溫、濕度、海拔、咖啡因、酒精與個人疾病影響，高溫高濕環境需求明顯上升。", interpretation: "解讀", interpretationText: "每日補水超過 3 公升屬偏高，超過 5 公升屬極高；可透過分次補充、加電解質、避開正午高溫與監測尿色來調整。", context: "脈絡", contextText: "補水結果應與防曬係數、高山症風險與旅遊預算一起看，才能在戶外行程中兼顧健康與防護。", example: "範例", exampleText: "體重 65、標準強度（40ml/kg）、活動 6 小時 → 每日補水約 3.8 公升，屬偏高，建議分次補充。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "補水的下一步工具", premiumTitle: "PRO 補水分析包", premiumText: "解鎖即時氣溫濕度串接、電解質配方、補水提醒與多日行程補水計畫。", feat1: "即時天氣", feat2: "電解質配比", feat3: "補水警示", feat4: "多日計畫",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代醫療建議或專業營養補水診斷。", relatedTools: "相關工具", relatedToolsText: "SPF · Altitude · Jet Lag · Travel Budget", references: "參考資料", referencesText: "運動營養學補水建議；每日飲水量指引；戶外脫水研究；電解質補充文獻。",
    q1: "每日補水怎麼算的？", a1: "本工具以體重乘活動強度係數得基礎補水，再加活動時數加成；實際還受氣溫與濕度影響。",
    q2: "補多少水才夠？", a2: "一般建議每日基礎約 30–40ml/kg，戶外或高強度再加成；以口渴、尿色淡黃為健康指標。",
    q3: "輕度還是高強度？", a3: "室內或輕鬆觀光偏輕度；登山健行或高溫活動宜選高強度，並補充電解質避免低鈉。",
    q4: "補水不足怎麼補？", a4: "增加飲水頻率、分次小口補充、加電解質、避開正午高溫、減少咖啡因與酒精利尿。",
    q5: "要不要把活動加成算進去？", a5: "要。本工具的活動加成已依戶外時數估算；實際請依流汗量與環境彈性增減。",
    q6: "這個工具能取代醫師嗎？", a6: "不能。它只是快速估算與教育用途；有腎臟、心臟疾病或特殊飲水限制請諮詢專業醫師。" },
  en: {
    badge: "Travel · Hydration · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Hydration Calculator", subtitle: "Compute daily recommended water intake and activity-bonus share from body weight, outdoor hours, and activity intensity",
    intro: "This calculator uses body weight, outdoor activity hours, and activity intensity (light, standard, or intense) to compute base daily water, an activity bonus, and total water intake, helping you judge how much to drink on hot or long outdoor trips, when to add electrolytes, and how to split intake to avoid dehydration or overload, keeping you energized and healthy on the road.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from body weight and activity intensity, excluding temperature, humidity, altitude, and personal conditions; adjust real intake flexibly by thirst, urine color, and how you feel.",
    quickActionCard: "Quick Action Card", tryExample: "Create a hydration example instantly", examplePreview: "Hydration preview", examplePerson: "Body weight", fillExample: "One-click standard intensity example", previewActivePath: "Fill intense example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter body weight, outdoor activity hours, and activity intensity", examplesHelper: "Start with an example to see how weight and intensity set the daily water and activity-bonus share, then replace with your own trip data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard intensity mode", activeExample: "Intense demo", baselineExampleNote: "Weight 65 · hours 6 · standard", activeExampleNote: "Weight 65 · hours 6 · intense", carbsLabel: "Activity-bonus share", carbsName: "%", proteinLabel: "Activity-bonus share", flowDemo: "Activity hours", calculator: "Calculator",
    weight: "Body weight (kg)", tdee: "Outdoor activity hours (h)", goal: "Activity intensity", goalCut: "Light (30ml/kg)", goalMaintain: "Standard (40ml/kg)", goalBulk: "Intense (55ml/kg)",
    resultCard: "Hydration Result", unit: "liters (daily intake)", primaryValue: "Primary Value", maintenanceTarget: "Activity-bonus water", actionTarget: "Daily intake", estimatedTdee: "Activity hours", maintenance: "ml", fatLossTarget: "liters",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card daily-water interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current daily water into common zones. This is planning guidance, not a medical conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the hydration result into an actionable itinerary strategy", conversionNote: "L9 values update from the computed result: activity-bonus share, daily water, and hours hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current hydration snapshot", dailyGap: "Activity-bonus share", weeklyTrend: "Daily water", motivation: "Motivation Card", keepMomentum: "Move from hydration analysis to an energized, never-dehydrated travel rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's hydration result to your group", journeyHint: "Review it with the SPF Calculator to fold daily water and reapply frequency into outdoor planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Plan outdoor protection with the SPF Calculator", nextActionItem2: "Assess high-altitude water needs with the Altitude Sickness Calculator", nextActionItem3: "Fold water and electrolytes into spend with Travel Budget",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Weight → Bonus Share → Intensity → Hours", bmrStep: "Weight", deficitStep: "Bonus share", trendStep: "Intensity", mealStep: "Hours",
    knowledge: "Knowledge", knowledgeTitle: "What activity intensity means in travel hydration", definition: "Definition", definitionText: "Travel hydration assessment converts body weight by activity intensity into base water, then adds an outdoor activity bonus; daily water and activity-bonus share measure your hydration need, the core indicator of staying energized on long outdoor trips.", formula: "Formula", formulaText: "Base water = weight × intensity factor (ml/kg). Activity bonus = activity hours × 200ml. Daily water = base + bonus.", limitations: "Limitations", limitationsText: "This tool estimates from body weight and activity intensity; real intake is also affected by temperature, humidity, altitude, caffeine, alcohol, and personal conditions, and rises markedly in hot, humid environments.", interpretation: "Interpretation", interpretationText: "Daily water over 3 liters is elevated and over 5 liters is severe; adjust it by splitting intake, adding electrolytes, avoiding midday heat, and watching urine color.", context: "Context", contextText: "Hydration results should be evaluated with SPF, altitude risk, and travel budget to balance health and protection on outdoor trips.", example: "Example", exampleText: "Weight 65, standard intensity (40ml/kg), 6 activity hours → about 3.8 liters daily water, elevated—split intake advised.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for hydration", premiumTitle: "PRO Hydration Analytics Pack", premiumText: "Unlock live temperature-humidity feeds, electrolyte formulas, hydration reminders, and multi-day trip hydration plans.", feat1: "Live Weather", feat2: "Electrolyte Mix", feat3: "Hydration Alert", feat4: "Multi Day Plan",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace medical advice or professional nutritional hydration diagnosis.", relatedTools: "Related Tools", relatedToolsText: "SPF · Altitude · Jet Lag · Travel Budget", references: "References", referencesText: "Sports-nutrition hydration advice; daily water-intake guidelines; outdoor-dehydration studies; electrolyte-replacement literature.",
    q1: "How is daily water calculated?", a1: "This tool multiplies body weight by an intensity factor for base water, then adds an activity-hours bonus; actual is also affected by temperature and humidity.",
    q2: "How much water is enough?", a2: "It is generally advised to drink about 30–40ml/kg base per day plus an outdoor or high-intensity bonus; use thirst and pale-yellow urine as health indicators.",
    q3: "Light or intense intensity?", a3: "Indoor or easy sightseeing leans light; hiking or hot-weather activity should pick intense, and add electrolytes to avoid low sodium.",
    q4: "How do I cover insufficient water?", a4: "Increase drinking frequency, sip in portions, add electrolytes, avoid midday heat, and cut caffeine and alcohol diuresis.",
    q5: "Should I count the activity bonus?", a5: "Yes. This tool's activity bonus is estimated from outdoor hours; in practice adjust by sweat rate and environment.",
    q6: "Can this tool replace a doctor?", a6: "No. It is a quick estimate for education; for kidney or heart disease or special fluid limits, consult a professional physician." },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function mlPerKg(mode: TierMode): number {
  if (mode === "light") return 30;
  if (mode === "intense") return 55;
  return 40;
}

export default function TravelHydrationCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("65");
  const [tdee, setTdee] = useState("6");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const bodyWeight = Number(weight);
    const hours = Number(tdee);
    if (bodyWeight <= 0 || hours < 0) return null;
    const baseWater = bodyWeight * mlPerKg(goal);
    const activityBonus = hours * 200;
    const totalWaterMl = baseWater + activityBonus;
    const totalWaterL = totalWaterMl / 1000;
    const bonusShare = totalWaterMl > 0 ? (activityBonus / totalWaterMl) * 100 : 0;
    return { bodyWeight, hours, activityBonus, totalWaterL, bonusShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.bonusShare, 1) : "—";
  const fatDisplay = result ? fmt(result.totalWaterL, 1) : "—";
  const carbDisplay = result ? fmt(result.activityBonus, 0) : "—";
  const totalDisplay = result ? fmt(result.totalWaterL, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("65"); setTdee("6"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("65"); setTdee("6"); setGoal("intense"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "light" ? "🟢" : goal === "intense" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3.8</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">4.8</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="light">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="intense">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{carbDisplay}</p><p className="text-sm font-bold text-blue-700">ml</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">L</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{proteinDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fatDisplay} <span className="text-sm text-slate-500">L</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="travel-hydration-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.bonusShare, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.totalWaterL, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Weight", note: t.bmrStep }, { label: "BonusShare", note: t.deficitStep }, { label: "Intensity", note: t.trendStep }, { label: "Hours", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="travel-hydration-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
