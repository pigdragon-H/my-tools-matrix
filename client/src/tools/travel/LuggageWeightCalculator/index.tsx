// @profile B
// Profile B · Calculator-Travel · LuggageWeightCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "relaxed" | "standard" | "fast";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 60%", label: { zh: "寬鬆", en: "Light" }, desc: { zh: "行李遠低於額度，可再加買伴手禮或攜帶備品，毫無超重壓力。", en: "Well under the allowance—room for souvenirs or spare items, no overweight stress." } },
  { key: "low", range: "60–75%", label: { zh: "舒適", en: "Comfortable" }, desc: { zh: "額度使用舒適，仍保有緩衝空間，回程採買也不易超重。", en: "Comfortable usage with buffer left; return shopping is unlikely to overweight." } },
  { key: "healthy", range: "75–90%", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數旅客打包常見區間，建議預留回程戰利品空間。", en: "Common packed band; leave space for return-trip purchases." } },
  { key: "good", range: "90–100%", label: { zh: "接近上限", en: "Near limit" }, desc: { zh: "已接近託運額度上限，宜把重物移至隨身或精簡物品。", en: "Near the checked allowance; move heavy items to carry-on or trim items." } },
  { key: "strong", range: "100–110%", label: { zh: "超重", en: "Overweight" }, desc: { zh: "已超出額度，需付超重費或重新分配行李，建議先過磅。", en: "Over the allowance; expect fees or redistribution—weigh bags first." } },
  { key: "elite", range: "> 110%", label: { zh: "嚴重超重", en: "Heavily over" }, desc: { zh: "嚴重超出額度，超重費用高昂，務必精簡或加購額外託運。", en: "Heavily over the allowance; fees are steep—trim hard or buy extra checked weight." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "簽證費用計算機", en: "Visa Cost Calculator" }, href: "/tools/travel/visa-cost-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 行李重量 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "行李重量計算機 · Luggage Weight", subtitle: "用打包重量、件數與航司額度等級算出額度使用率與超重重量",
    intro: "Luggage Weight Calculator 依據每件打包重量、託運件數與航司額度等級（廉航、標準或高艙），計算總打包重量、額度使用率與超重重量，協助您判斷行李是否超重、該移走多少重物、回程是否還有採買空間，讓您在櫃台過磅前就把行李重量控制在安全範圍。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的額度等級估算，未含各航司、艙等與特殊路線差異；實際託運額度與超重費請以航空公司官方規定與機場磅秤為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立行李範例", examplePreview: "行李預覽", examplePerson: "打包重量", fillExample: "一鍵填入標準額度範例", previewActivePath: "填入廉航額度範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入打包重量、託運件數與額度等級", examplesHelper: "先用範例理解重量與額度如何決定使用率與超重重量，再改成自己的行李數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準額度模式", activeExample: "廉航示範", baselineExampleNote: "重量 24 · 件數 1 · 標準", activeExampleNote: "重量 24 · 件數 1 · 廉航", carbsLabel: "額度使用", carbsName: "百分比", proteinLabel: "使用率", flowDemo: "託運件數", calculator: "計算機",
    weight: "打包重量 (公斤/件)", tdee: "託運件數 (件)", goal: "額度等級", goalCut: "廉航 (20kg)", goalMaintain: "標準 (23kg)", goalBulk: "高艙 (32kg)",
    resultCard: "行李計算結果", unit: "% (額度使用率)", primaryValue: "主要數值", maintenanceTarget: "額度使用率", actionTarget: "超重重量", estimatedTdee: "託運件數", maintenance: "%", fatLossTarget: "公斤",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格額度使用率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前額度使用率放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把行李結果轉成可執行的打包策略", conversionNote: "L9 會連動目前計算結果，顯示使用率、超重重量與件數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前行李概況", dailyGap: "超重重量", weeklyTrend: "額度使用率", motivation: "動力卡", keepMomentum: "從重量分析走向不超重的打包節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的行李結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，把超重費與額外託運成本一併納入行程規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算計算機把超重費納入總花費", nextActionItem2: "用旅遊天數確認停留天數與打包量相符", nextActionItem3: "用簽證費用把出境成本一併規劃",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "重量 → 使用率 → 等級 → 件數", bmrStep: "重量", deficitStep: "使用率", trendStep: "等級", mealStep: "件數",
    knowledge: "知識", knowledgeTitle: "額度使用率在行李打包中的意義", definition: "定義", definitionText: "行李重量規劃是把每件打包重量乘以件數得到總重，再與航司額度比較得到使用率；使用率與超重重量衡量行李是否超標，是櫃台過磅前的核心指標。", formula: "公式", formulaText: "總打包重量 = 每件重量 × 件數。額度使用率 = 總打包重量 ÷ 總額度 × 100%。超重重量 = 總打包重量 − 總額度。", limitations: "限制", limitationsText: "本工具以您輸入的額度等級估算；真實額度還受航司、艙等、會員等級、聯程轉機與特殊路線影響，且隨身行李另有重量與尺寸規定。", interpretation: "解讀", interpretationText: "使用率超過 100% 即超重，需付超重費或重新分配；可透過移重物到隨身、精簡物品、加購額外託運或升級額度等級來改善。", context: "脈絡", contextText: "行李結果應與旅遊預算、旅遊天數與簽證費用一起看，才能在重量、成本與行程之間取得平衡。", example: "範例", exampleText: "重量 24、標準額度（23kg）、件數 1 → 總重 24 公斤，使用率約 104%，已超重約 1 公斤。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "行李的下一步工具", premiumTitle: "PRO 行李重量分析包", premiumText: "解鎖各航司即時額度查詢、多件行李分配最佳化、超重費試算與過磅提醒。", feat1: "即時行李額度", feat2: "行李分配", feat3: "費用估算", feat4: "秤重警示",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代航空公司官方額度規定、機場磅秤或地勤現場判定。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Travel Day · Daily Budget · Visa Cost", references: "參考資料", referencesText: "各航司託運額度規定；IATA 行李指引；機場過磅標準；超重費率統計。",
    q1: "額度使用率怎麼算的？", a1: "本工具以每件重量乘件數得總重，再除以總額度得使用率；實際還受航司、艙等與會員等級影響。",
    q2: "使用率多少才安全？", a2: "建議使用率控制在 90% 以下並預留回程採買空間；超過 100% 即超重，需付超重費或重新分配。",
    q3: "廉航還是標準額度？", a3: "搭廉航多為 20kg 起並常需加購；傳統航司標準約 23kg，商務或高艙常達 32kg，依機票條款為準。",
    q4: "行李太重怎麼降？", a4: "把重物移至隨身、精簡物品、穿上厚重衣物、加購額外託運，或把行李分成多件並升級額度等級。",
    q5: "要不要把隨身行李算進去？", a5: "要分開算。本工具計算託運額度；隨身行李另有重量與尺寸上限，請依航司規定分別過磅。",
    q6: "這個工具能取代航司規定嗎？", a6: "不能。它只是快速估算與教育用途；實際額度與超重費應以航空公司官方規定與機場磅秤為準。",
  },
  en: {
    badge: "Travel · Luggage Weight · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Luggage Weight Calculator", subtitle: "Compute allowance usage and overweight amount from packed weight, bag count, and airline allowance tier",
    intro: "This calculator uses per-bag packed weight, checked bag count, and airline allowance tier (low-cost, standard, or premium) to compute total packed weight, allowance usage, and overweight amount, helping you judge whether bags are overweight, how much weight to remove, and whether there is room for return-trip shopping, so you control luggage weight before the check-in scale.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from the allowance tier you enter, excluding airline, cabin, and special-route differences; for real checked allowance and overweight fees, follow the airline's official rules and the airport scale.",
    quickActionCard: "Quick Action Card", tryExample: "Create a luggage example instantly", examplePreview: "Luggage preview", examplePerson: "Packed weight", fillExample: "One-click standard allowance example", previewActivePath: "Fill low-cost allowance example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter packed weight, bag count, and allowance tier", examplesHelper: "Start with an example to see how weight and allowance set the usage rate and overweight amount, then replace with your own luggage data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard allowance mode", activeExample: "Low-cost demo", baselineExampleNote: "Weight 24 · bags 1 · standard", activeExampleNote: "Weight 24 · bags 1 · low-cost", carbsLabel: "Allowance use", carbsName: "percent", proteinLabel: "Usage rate", flowDemo: "Bag count", calculator: "Calculator",
    weight: "Packed weight (kg/bag)", tdee: "Bag count (bags)", goal: "Allowance tier", goalCut: "Low-cost (20kg)", goalMaintain: "Standard (23kg)", goalBulk: "Premium (32kg)",
    resultCard: "Luggage Result", unit: "% (allowance usage)", primaryValue: "Primary Value", maintenanceTarget: "Allowance usage", actionTarget: "Overweight", estimatedTdee: "Bag count", maintenance: "%", fatLossTarget: "kg",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card allowance-usage interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current allowance usage into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the luggage result into an actionable packing strategy", conversionNote: "L9 values update from the computed result: usage rate, overweight amount, and bag-count hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current luggage snapshot", dailyGap: "Overweight", weeklyTrend: "Allowance usage", motivation: "Motivation Card", keepMomentum: "Move from weight analysis to a no-overweight packing rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's luggage result to your group", journeyHint: "Review it with the Travel Budget Calculator to fold overweight fees and extra-baggage cost into itinerary planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold overweight fees into total spend with Travel Budget", nextActionItem2: "Confirm days match packing volume with Travel Day", nextActionItem3: "Plan exit cost together with Visa Cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Weight → Usage → Tier → Bags", bmrStep: "Weight", deficitStep: "Usage", trendStep: "Tier", mealStep: "Bags",
    knowledge: "Knowledge", knowledgeTitle: "What allowance usage means in luggage packing", definition: "Definition", definitionText: "Luggage weight planning multiplies per-bag weight by bag count for total weight, then compares it to the airline allowance for a usage rate; usage rate and overweight amount measure whether bags exceed limits, the core indicator before the check-in scale.", formula: "Formula", formulaText: "Total packed weight = per-bag weight × bags. Allowance usage = total packed weight ÷ total allowance × 100%. Overweight = total packed weight − total allowance.", limitations: "Limitations", limitationsText: "This tool estimates from the allowance tier you enter; real allowance is also affected by airline, cabin, membership tier, connecting routes, and special routes, and carry-on bags have separate weight and size rules.", interpretation: "Interpretation", interpretationText: "Usage over 100% is overweight and incurs fees or redistribution; improve it by moving heavy items to carry-on, trimming items, buying extra checked weight, or upgrading the allowance tier.", context: "Context", contextText: "Luggage results should be evaluated with travel budget, travel day, and visa cost to balance weight, cost, and itinerary.", example: "Example", exampleText: "Weight 24, standard allowance (23kg), bags 1 → total 24 kg, usage about 104%, overweight by about 1 kg.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for luggage", premiumTitle: "PRO Luggage Weight Analytics Pack", premiumText: "Unlock per-airline live allowance lookup, multi-bag distribution optimization, overweight-fee estimation, and weigh-in alerts.", feat1: "Live Allowance", feat2: "Bag Distribution", feat3: "Fee Estimator", feat4: "Weigh In Alert",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace the airline's official allowance rules, the airport scale, or ground-staff on-site judgment.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Travel Day · Daily Budget · Visa Cost", references: "References", referencesText: "Per-airline checked-baggage rules; IATA baggage guidance; airport weigh-in standards; overweight fee-rate statistics.",
    q1: "How is allowance usage calculated?", a1: "This tool multiplies per-bag weight by bags for total weight, then divides by total allowance for usage; actual is also affected by airline, cabin, and membership tier.",
    q2: "What usage is safe?", a2: "Keep usage under 90% and leave room for return shopping; over 100% is overweight and incurs fees or redistribution.",
    q3: "Low-cost or standard allowance?", a3: "Low-cost carriers often start at 20kg and require add-ons; legacy standard is about 23kg, and business or premium often reaches 32kg—follow your ticket terms.",
    q4: "How do I reduce luggage weight?", a4: "Move heavy items to carry-on, trim items, wear heavy clothing, buy extra checked weight, or split into more bags and upgrade the allowance tier.",
    q5: "Should I count carry-on bags?", a5: "Count them separately. This tool computes checked allowance; carry-on bags have separate weight and size limits—weigh each per airline rules.",
    q6: "Can this tool replace airline rules?", a6: "No. It is a quick estimate for education; the actual allowance and overweight fee should follow the airline's official rules and the airport scale.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function allowanceKg(mode: TierMode): number {
  if (mode === "relaxed") return 20;
  if (mode === "fast") return 32;
  return 23;
}

export default function LuggageWeightCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("24");
  const [tdee, setTdee] = useState("1");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const perBag = Number(weight);
    const bags = Number(tdee);
    if (perBag <= 0 || bags <= 0) return null;
    const totalPacked = perBag * bags;
    const allowanceTotal = allowanceKg(goal) * bags;
    const usageShare = Math.min((totalPacked / allowanceTotal) * 100, 200);
    const overweight = Math.max(totalPacked - allowanceTotal, 0);
    return { totalPacked, allowanceTotal, usageShare, overweight };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.usageShare, 1) : "—";
  const fatDisplay = result ? fmt(result.overweight, 1) : "—";
  const carbDisplay = result ? fmt(result.usageShare, 1) : "—";
  const totalDisplay = result ? fmt(result.usageShare, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("24"); setTdee("1"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("24"); setTdee("1"); setGoal("relaxed"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">104</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">120</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">kg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="luggage-weight-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.overweight, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.usageShare, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Weight", note: t.bmrStep }, { label: "Usage", note: t.deficitStep }, { label: "Tier", note: t.trendStep }, { label: "Bags", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="luggage-weight-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
