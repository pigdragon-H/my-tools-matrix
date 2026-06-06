// @profile B
// Profile B · Calculator-Travel · FuelCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "eco" | "standard" | "thirsty";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 3", label: { zh: "極省", en: "Very low" }, desc: { zh: "每公里油費極低，屬高效率車或低油價，最划算。", en: "Fuel cost per km is very low—an efficient car or low fuel price, the best deal." } },
  { key: "low", range: "3–5", label: { zh: "偏省", en: "Low" }, desc: { zh: "每公里油費偏低，長途行駛仍經濟。", en: "Low per-km fuel cost; still economical on long drives." } },
  { key: "healthy", range: "5–8", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數車輛常見區間，油費成本可接受。", en: "Common vehicle band; fuel cost is acceptable." } },
  { key: "good", range: "8–11", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "每公里油費偏高，宜檢視車速、載重或路線。", en: "Elevated per-km cost; review speed, load, or route." } },
  { key: "strong", range: "11–15", label: { zh: "高", en: "High" }, desc: { zh: "油費明顯，建議共乘分攤或改用大眾運輸。", en: "Cost is notable; carpool to split it or switch to public transit." } },
  { key: "elite", range: "> 15", label: { zh: "過高", en: "Excessive" }, desc: { zh: "每公里油費過高，務必共乘、換省油車或改路線。", en: "Excessive per-km cost; carpool, switch to an efficient car, or change route." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "公路旅行計算機", en: "Road Trip Calculator" }, href: "/tools/travel/road-trip-calculator" },
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "旅遊價格比較器", en: "Travel Price Comparator" }, href: "/tools/travel/travel-price-comparator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 油費 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "油費計算機 · Fuel Cost", subtitle: "用行駛距離、油價與車輛油耗等級算出總油費與每百公里油費成本",
    intro: "Fuel Cost Calculator 依據行駛距離、每公升油價與車輛油耗等級，計算整趟所需油量、總油費與每百公里油費成本，協助你判斷自駕是否划算、是否該共乘分攤、換省油車或改用大眾運輸來控制交通開銷。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以平均油耗與固定油價估算，未含怠速、塞車、空調與載重影響；正式油費以實際加油單據為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立油費範例", examplePreview: "油費預覽", examplePerson: "行駛距離", fillExample: "一鍵填入標準油費範例", previewActivePath: "填入高油耗範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入行駛距離、每公升油價與油耗等級", examplesHelper: "先用範例理解距離與油耗如何決定總油費與每公里成本，再改成自己的行程數據。",
    metric: "公制", imperial: "成本檢視", exampleCards: "範例卡", baselineExample: "標準油耗模式", activeExample: "高油耗示範", baselineExampleNote: "距離 600 · 油價 32 · 標準", activeExampleNote: "距離 600 · 油價 32 · 高油耗", carbsLabel: "總油費", carbsName: "元", proteinLabel: "每百公里", flowDemo: "每公升油價", calculator: "計算機",
    weight: "行駛距離 (公里)", tdee: "每公升油價 (元)", goal: "車輛油耗等級", goalCut: "省油 (5L/100km)", goalMaintain: "標準 (8L/100km)", goalBulk: "耗油 (13L/100km)",
    resultCard: "油費計算結果", unit: "元 (總油費)", primaryValue: "主要數值", maintenanceTarget: "每百公里", actionTarget: "總油費", estimatedTdee: "油價", maintenance: "元/100km", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格每公里油費判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每公里油費放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把油費結果轉成可執行的交通策略", conversionNote: "L9 會連動目前計算結果，顯示每公里成本、總油費與油價提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前油費概況", dailyGap: "每公里", weeklyTrend: "總油費", motivation: "動力卡", keepMomentum: "從油費分析走向划算的交通安排",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的油費結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，把油費納入總花費並評估共乘分攤。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用公路旅行把油費加進整趟成本", nextActionItem2: "用旅遊預算把油費納入總花費", nextActionItem3: "用每日預算把油費攤到每日花費",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "距離 → 每公里 → 油耗 → 預算", bmrStep: "距離", deficitStep: "每公里", trendStep: "油耗", mealStep: "預算",
    knowledge: "知識", knowledgeTitle: "油費在行程規劃中的意義", definition: "定義", definitionText: "油費是整趟自駕的燃料成本，以行駛距離、車輛油耗與油價計算；每公里油費衡量單位距離的開銷，是評估自駕經濟性的核心指標。", formula: "公式", formulaText: "所需油量 = 距離 ÷ 100 × 百公里油耗。總油費 = 所需油量 × 每公升油價。每百公里 = 總油費 ÷ 距離 × 100。", limitations: "限制", limitationsText: "本工具以平均油耗與固定油價估算；真實油費還受怠速、塞車、空調、載重、胎壓、路況與駕駛習慣影響，且油價會隨地區與時間變動。", interpretation: "解讀", interpretationText: "每公里油費越高越不經濟；可透過共乘分攤、換省油車、調整路線與車速、保持胎壓與減少載重來改善。", context: "脈絡", contextText: "油費應與公路旅行、旅遊預算與每日花費一起看，才能在便利、成本與時間之間取得平衡。", example: "範例", exampleText: "距離 600、標準油耗（8L/100km）、油價 32 → 所需油量 48L、總油費 1536，每百公里約 256。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "油費的下一步工具", premiumTitle: "PRO 油費分析包", premiumText: "解鎖即時油價串接、車款油耗資料庫、塞車與載重修正及共乘分攤試算。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代加油站報價、車輛原廠數據或專業建議。", relatedTools: "相關工具", relatedToolsText: "Road Trip · Travel Budget · Daily Budget · Price Comparator", references: "參考資料", referencesText: "各國油價統計；車輛原廠油耗數據；EPA 油耗測試；交通成本研究。",
    q1: "總油費怎麼算的？", a1: "本工具以距離除以百公里換算所需油量，再乘油價估算；實際油費還受路況、載重與駕駛習慣影響。",
    q2: "每公里油費多少合理？", a2: "依車輛而定，5–8 元多屬可接受；超過 15 元表示每公里成本過高，宜共乘分攤或換省油車。",
    q3: "省油還是耗油車？", a3: "長途與常跑可選省油車；偶爾短程影響有限。應依年行駛里程與油價綜合評估購車與用車成本。",
    q4: "油費太高怎麼降？", a4: "共乘分攤、換省油車、調整路線避開塞車、保持適當車速與胎壓、減少不必要載重，並在低油價時加滿。",
    q5: "為何實際比估算高？", a5: "怠速、塞車、空調、上坡、載重與胎壓不足都會增加油耗；本工具用平均值估算，實際常略高。",
    q6: "這個工具能取代加油單據嗎？", a6: "不能。它只是快速估算與教育用途；正式油費應以實際加油單據與里程紀錄為準。",
  },
  en: {
    badge: "Travel · Fuel · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Fuel Cost Calculator", subtitle: "Compute total fuel cost and per-100km fuel cost from distance, fuel price, and vehicle efficiency tier",
    intro: "This calculator uses driving distance, price per liter, and vehicle efficiency tier to compute the fuel needed, total fuel cost, and per-100km fuel cost, helping you judge whether driving is economical and whether to carpool, switch to an efficient car, or use public transit to control transport spend.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from average efficiency and a fixed fuel price, excluding idling, traffic, air-conditioning, and load effects; rely on actual fuel receipts for the formal cost.",
    quickActionCard: "Quick Action Card", tryExample: "Create a fuel example instantly", examplePreview: "Fuel preview", examplePerson: "Distance", fillExample: "One-click standard fuel example", previewActivePath: "Fill high-consumption example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter distance, price per liter, and efficiency tier", examplesHelper: "Start with an example to see how distance and efficiency set the total fuel cost and per-km cost, then replace with your own trip data.",
    metric: "Metric", imperial: "Cost view", exampleCards: "Example cards", baselineExample: "Standard efficiency mode", activeExample: "High-consumption demo", baselineExampleNote: "Distance 600 · price 32 · standard", activeExampleNote: "Distance 600 · price 32 · thirsty", carbsLabel: "Total fuel cost", carbsName: "currency", proteinLabel: "Per 100km", flowDemo: "Price per liter", calculator: "Calculator",
    weight: "Distance (km)", tdee: "Price per liter (currency)", goal: "Vehicle efficiency tier", goalCut: "Eco (5L/100km)", goalMaintain: "Standard (8L/100km)", goalBulk: "Thirsty (13L/100km)",
    resultCard: "Fuel Cost Result", unit: "currency (total fuel cost)", primaryValue: "Primary Value", maintenanceTarget: "Per 100km", actionTarget: "Total fuel cost", estimatedTdee: "Price", maintenance: "/100km", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card per-km fuel-cost interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current per-km fuel cost into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the fuel result into an actionable transport strategy", conversionNote: "L9 values update from the computed result: per-km cost, total fuel cost, and price hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current fuel snapshot", dailyGap: "Per km", weeklyTrend: "Total fuel cost", motivation: "Motivation Card", keepMomentum: "Move from fuel analysis to economical transport arrangement",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's fuel result to your group", journeyHint: "Review it with the Travel Budget Calculator to fold fuel into total spend and assess carpool splitting.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Add fuel into whole-trip cost with Road Trip", nextActionItem2: "Fold fuel into total spend with Travel Budget", nextActionItem3: "Spread fuel into daily spend with Daily Budget",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Distance → Per Km → Efficiency → Budget", bmrStep: "Distance", deficitStep: "Per km", trendStep: "Efficiency", mealStep: "Budget",
    knowledge: "Knowledge", knowledgeTitle: "What fuel cost means in trip planning", definition: "Definition", definitionText: "Fuel cost is the whole-trip fuel expense of driving, computed from distance, vehicle efficiency, and fuel price; per-km fuel cost measures the spend per unit distance, the core indicator of driving economy.", formula: "Formula", formulaText: "Fuel needed = distance ÷ 100 × per-100km consumption. Total fuel cost = fuel needed × price per liter. Per 100km = total fuel cost ÷ distance × 100.", limitations: "Limitations", limitationsText: "This tool estimates from average efficiency and a fixed fuel price; real fuel cost is also affected by idling, traffic, air-conditioning, load, tire pressure, road conditions, and driving habits, while fuel prices vary by region and time.", interpretation: "Interpretation", interpretationText: "A higher per-km fuel cost is less economical; improve it by carpooling, switching to an efficient car, adjusting route and speed, keeping tire pressure, and reducing load.", context: "Context", contextText: "Fuel cost should be evaluated with road trip, travel budget, and daily spend to balance convenience, cost, and time.", example: "Example", exampleText: "Distance 600, standard efficiency (8L/100km), price 32 → fuel needed 48L, total fuel cost 1536, per 100km about 256.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for fuel", premiumTitle: "PRO Fuel Cost Analytics Pack", premiumText: "Unlock live fuel-price feeds, a vehicle efficiency database, traffic-and-load corrections, and carpool split estimation.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace gas-station quotes, vehicle factory data, or professional advice.", relatedTools: "Related Tools", relatedToolsText: "Road Trip · Travel Budget · Daily Budget · Price Comparator", references: "References", referencesText: "National fuel-price statistics; vehicle factory efficiency data; EPA fuel-economy tests; transport cost studies.",
    q1: "How is total fuel cost calculated?", a1: "This tool estimates fuel needed from distance over the per-100km consumption, then times the price; actual cost is also affected by road conditions, load, and driving habits.",
    q2: "What per-km fuel cost is reasonable?", a2: "It depends on the vehicle; 5–8 is usually acceptable; above 15 means per-km cost is excessive, so carpool to split or switch to an efficient car.",
    q3: "Eco or thirsty car?", a3: "Long-distance and frequent driving favor an eco car; occasional short trips matter less. Assess purchase and use cost by annual mileage and fuel price together.",
    q4: "How do I lower high fuel cost?", a4: "Carpool to split, switch to an efficient car, adjust the route to avoid traffic, keep a proper speed and tire pressure, reduce unneeded load, and fill up when prices are low.",
    q5: "Why is actual higher than the estimate?", a5: "Idling, traffic, air-conditioning, uphill, load, and low tire pressure all raise consumption; this tool uses averages, so actual is often slightly higher.",
    q6: "Can this tool replace fuel receipts?", a6: "No. It is a quick estimate for education; the formal fuel cost should rely on actual receipts and mileage records.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function consumption(mode: TierMode): number {
  if (mode === "eco") return 5;
  if (mode === "thirsty") return 13;
  return 8;
}

export default function FuelCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("600");
  const [tdee, setTdee] = useState("32");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const distance = Number(weight);
    const pricePerLiter = Number(tdee);
    if (distance <= 0 || pricePerLiter <= 0) return null;
    const fuelNeeded = (distance / 100) * consumption(goal);
    const totalFuel = fuelNeeded * pricePerLiter;
    const perHundred = (totalFuel / distance) * 100;
    return { distance, pricePerLiter, totalFuel, perHundred };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.perHundred, 1) : "—";
  const fatDisplay = result ? fmt(result.totalFuel, 0) : "—";
  const carbDisplay = result ? fmt(result.totalFuel, 0) : "—";
  const totalDisplay = result ? fmt(result.totalFuel, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("600"); setTdee("32"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("600"); setTdee("32"); setGoal("thirsty"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "eco" ? "🟢" : goal === "thirsty" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">1536</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">2496</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="eco">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="thirsty">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">$</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="fuel-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.perHundred, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.totalFuel, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Distance", note: t.bmrStep }, { label: "PerKm", note: t.deficitStep }, { label: "Efficiency", note: t.trendStep }, { label: "Budget", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="fuel-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["LiveFuelPrice", "VehicleDatabase", "TrafficCorrection", "CarpoolSplit"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
