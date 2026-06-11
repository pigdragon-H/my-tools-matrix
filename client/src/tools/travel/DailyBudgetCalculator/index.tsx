// @profile B
// Profile B · Calculator-Travel · DailyBudgetCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "thrifty" | "standard" | "comfort";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 50%", label: { zh: "極寬裕", en: "Very loose" }, desc: { zh: "每日花費遠低於舒適目標，預算十分寬裕，可升級體驗。", en: "Daily spend far below comfort target; budget is very loose and you can upgrade." } },
  { key: "low", range: "50–75%", label: { zh: "寬裕", en: "Loose" }, desc: { zh: "每日花費低於目標，仍有彈性空間應付臨時支出。", en: "Daily spend below target; flexible room remains for unexpected costs." } },
  { key: "healthy", range: "75–95%", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數行程常見區間，每日花費貼近舒適目標。", en: "Common trip band; daily spend tracks close to the comfort target." } },
  { key: "good", range: "95–110%", label: { zh: "貼線", en: "On the line" }, desc: { zh: "每日花費貼近或略超目標，需留意臨時支出。", en: "Daily spend near or slightly over target; watch for unexpected costs." } },
  { key: "strong", range: "110–130%", label: { zh: "偏緊", en: "Tight" }, desc: { zh: "每日花費明顯超標，宜下修等級或拉長天數攤平。", en: "Daily spend clearly over; downgrade tier or extend days to spread it." } },
  { key: "elite", range: "> 130%", label: { zh: "超支", en: "Over budget" }, desc: { zh: "每日花費嚴重超標，需重新分配總預算或縮減項目。", en: "Daily spend heavily over; reallocate total budget or cut items." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "住宿成本計算機", en: "Hotel Cost Calculator" }, href: "/tools/travel/hotel-cost-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "旅遊貨幣換算器", en: "Travel Currency Converter" }, href: "/tools/travel/currency-travel-converter" },
];

const ui = {
  zh: {
    badge: "旅遊 · 每日預算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "每日預算計算機 · Daily Budget", subtitle: "用行程天數、地面預算與舒適等級算出每日可用花費與占舒適目標比例",
    intro: "Daily Budget Calculator 依據行程天數、地面預算（不含機票）與舒適等級，計算每天可用的花費上限與占舒適目標比例，協助您判斷每日花費是否寬裕或超標、是否該下修等級、拉長天數或重新分配總預算來控制成本。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以地面預算除以天數估算每日可用花費，未含機票、簽證與保險；舒適目標僅為規劃參考，實際花費依目的地物價而定。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立每日預算範例", examplePreview: "每日預覽", examplePerson: "行程天數", fillExample: "一鍵填入標準每日範例", previewActivePath: "填入舒適每日範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入行程天數、地面預算與舒適等級", examplesHelper: "先用範例理解天數與等級如何決定每日花費與占比，再改成自己的行程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準每日模式", activeExample: "舒適示範", baselineExampleNote: "天數 7 · 地面 28000 · 標準", activeExampleNote: "天數 7 · 地面 28000 · 舒適", carbsLabel: "每日花費", carbsName: "元", proteinLabel: "占舒適比", flowDemo: "地面預算", calculator: "計算機",
    weight: "行程天數 (天)", tdee: "地面預算 (元)", goal: "舒適等級", goalCut: "精省 (2000/天)", goalMaintain: "標準 (3500/天)", goalBulk: "舒適 (6000/天)",
    resultCard: "每日預算結果", unit: "元 (每日花費)", primaryValue: "主要數值", maintenanceTarget: "占舒適比", actionTarget: "每日花費", estimatedTdee: "地面預算", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格每日占比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日花費占舒適目標比例放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把每日預算結果轉成可執行的花費策略", conversionNote: "L9 會連動目前計算結果，顯示占舒適比、每日花費與地面預算提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前每日概況", dailyGap: "占舒適比", weeklyTrend: "每日花費", motivation: "動力卡", keepMomentum: "從每日分析走向均衡的旅遊配置",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的每日預算結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，避免某天花費過高排擠其他天。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算把每日花費納入總花費", nextActionItem2: "用住宿成本估算扣掉房費後的可用花費", nextActionItem3: "用旅遊天數確認天數與行程相符",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "每日花費 → 占舒適比 → 預算 → 住宿", bmrStep: "每日花費", deficitStep: "占舒適比", trendStep: "預算", mealStep: "住宿",
    knowledge: "知識", knowledgeTitle: "每日預算在行程規劃中的意義", definition: "定義", definitionText: "每日預算是地面預算平均分配到每天的可用花費，常以地面預算除以天數計；占舒適目標比例衡量每天花費相對理想水準的鬆緊度，是日常花費控管的核心指標。", formula: "公式", formulaText: "每日花費 = 地面預算 ÷ 行程天數。占舒適比 = 每日花費 ÷ 舒適目標（依等級）× 100%。", limitations: "限制", limitationsText: "本工具以地面預算除以天數估算；真實每日花費還需考量餐飲、交通、門票、購物與臨時支出，且各天花費往往不均，目的地物價差異也大。", interpretation: "解讀", interpretationText: "占舒適比越高，每日越緊；可透過下修舒適等級、拉長天數攤平、減少高價項目或重新分配總預算來改善。", context: "脈絡", contextText: "每日花費應與旅遊預算、住宿成本與天數一起看，才能在舒適、成本與體驗之間取得平衡。", example: "範例", exampleText: "天數 7、標準等級（3500/天）、地面預算 28000 → 每日花費 4000，占舒適比約 114%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "每日預算的下一步工具", premiumTitle: "PRO 每日預算分析包", premiumText: "解鎖逐日花費分布、餐飲交通細分、超支警示與多目的地物價基準報告。", feat1: "每日分配", feat2: "餐飲交通", feat3: "超支警示", feat4: "物價對標",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代專業財務、訂房平台或旅行社建議。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Hotel Cost · Travel Day · Currency Converter", references: "參考資料", referencesText: "全球旅遊每日花費基準；OECD 旅遊統計；各國物價指數；旅遊預算研究。",
    q1: "每日花費怎麼算的？", a1: "本工具以地面預算除以行程天數估算每日可用花費；地面預算指不含機票的開銷總和，實際每天花費往往不均。",
    q2: "占舒適比多少合理？", a2: "依旅遊型態而定，多數行程落在 75–95%；超過 130% 表示每日嚴重超標，宜下修等級或拉長天數攤平。",
    q3: "精省還是舒適等級？", a3: "背包或省錢旅可選精省；度假或重視體驗可選舒適。應依地面預算上限與每天想要的生活品質取捨。",
    q4: "每日太緊怎麼降？", a4: "下修舒適等級、拉長天數攤平固定成本、減少高價餐飲與門票、避開旺季，或重新分配總預算。",
    q5: "地面預算包含機票嗎？", a5: "不包含。地面預算指抵達後的食宿交通購物等開銷；機票應在旅遊預算計算機中單獨納入。",
    q6: "這個工具能取代記帳嗎？", a6: "不能。它只是快速估算與規劃用途；正式花費應以實際記帳與每日明細為準。",
  },
  en: {
    badge: "Travel · Daily Budget · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Daily Budget Calculator", subtitle: "Compute daily available spend and its share of the comfort target from trip days, ground budget, and comfort tier",
    intro: "This calculator uses trip days, ground budget (excluding airfare), and comfort tier to compute the daily spending ceiling and its share of the comfort target, helping you judge whether daily spend is loose or over budget and whether to downgrade the tier, extend days, or reallocate the total budget to control cost.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates daily spend as ground budget divided by days, excluding airfare, visa, and insurance; the comfort target is planning guidance only, and real spend depends on destination prices.",
    quickActionCard: "Quick Action Card", tryExample: "Create a daily budget example instantly", examplePreview: "Daily preview", examplePerson: "Trip days", fillExample: "One-click standard daily example", previewActivePath: "Fill comfort daily example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter trip days, ground budget, and comfort tier", examplesHelper: "Start with an example to see how days and tier set the daily spend and share, then replace with your own itinerary data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard daily mode", activeExample: "Comfort demo", baselineExampleNote: "Days 7 · ground 28000 · standard", activeExampleNote: "Days 7 · ground 28000 · comfort", carbsLabel: "Daily spend", carbsName: "currency", proteinLabel: "Comfort share", flowDemo: "Ground budget", calculator: "Calculator",
    weight: "Trip days (days)", tdee: "Ground budget (currency)", goal: "Comfort tier", goalCut: "Thrifty (2000/day)", goalMaintain: "Standard (3500/day)", goalBulk: "Comfort (6000/day)",
    resultCard: "Daily Budget Result", unit: "currency (daily spend)", primaryValue: "Primary Value", maintenanceTarget: "Comfort share", actionTarget: "Daily spend", estimatedTdee: "Ground budget", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card daily-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current daily-spend share of the comfort target into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the daily budget result into an actionable spending strategy", conversionNote: "L9 values update from the computed result: comfort share, daily spend, and ground-budget hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current daily snapshot", dailyGap: "Comfort share", weeklyTrend: "Daily spend", motivation: "Motivation Card", keepMomentum: "Move from daily analysis to a balanced trip setup",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's daily budget result to your group", journeyHint: "Review it with the Travel Budget Calculator so one day's spend does not crowd out the others.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold daily spend into total spend with Travel Budget", nextActionItem2: "Estimate spend after lodging with Hotel Cost", nextActionItem3: "Confirm days match itinerary with Travel Day",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Daily Spend → Comfort Share → Budget → Lodging", bmrStep: "Daily spend", deficitStep: "Comfort share", trendStep: "Budget", mealStep: "Lodging",
    knowledge: "Knowledge", knowledgeTitle: "What a daily budget means in trip planning", definition: "Definition", definitionText: "A daily budget is the ground budget spread evenly across each day, often ground budget divided by days; its share of the comfort target measures how tight daily spend is versus the ideal level, the core indicator of day-to-day spend control.", formula: "Formula", formulaText: "Daily spend = ground budget ÷ trip days. Comfort share = daily spend ÷ comfort target (by tier) × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from ground budget divided by days; real daily spend also considers meals, transport, tickets, shopping, and unexpected costs, and daily spend is often uneven while destination prices vary widely.", interpretation: "Interpretation", interpretationText: "A higher comfort share means tighter days; improve it by downgrading the comfort tier, extending days to spread cost, cutting high-price items, or reallocating the total budget.", context: "Context", contextText: "Daily spend should be evaluated with travel budget, hotel cost, and days to balance comfort, cost, and experience.", example: "Example", exampleText: "7 days, standard tier (3500/day), ground budget 28000 → daily spend 4000, comfort share about 114%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for daily budget", premiumTitle: "PRO Daily Budget Analytics Pack", premiumText: "Unlock day-by-day spend distribution, meal-transport breakdown, overspend alerts, and multi-destination price-benchmark reports.", feat1: "Daily Distribution", feat2: "Meal Transport", feat3: "Overspend Alert", feat4: "Price Benchmark",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace professional financial, booking-platform, or travel-agency advice.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Hotel Cost · Travel Day · Currency Converter", references: "References", referencesText: "Global daily travel-spend benchmarks; OECD tourism statistics; national price indices; travel budget studies.",
    q1: "How is daily spend calculated?", a1: "This tool estimates it as ground budget divided by trip days; the ground budget is total spend excluding airfare, and real daily spend is often uneven.",
    q2: "What comfort share is reasonable?", a2: "It depends on travel style; most trips land at 75–95%; above 130% means daily spend is heavily over, so downgrade the tier or extend days to spread it.",
    q3: "Thrifty or comfort tier?", a3: "Backpacking or budget trips can pick thrifty; resort or experience-focused trips can pick comfort. Weigh it by ground-budget ceiling and the daily quality of life you want.",
    q4: "How do I ease a tight daily budget?", a4: "Downgrade the comfort tier, extend days to spread fixed cost, cut high-price meals and tickets, avoid peak season, or reallocate the total budget.",
    q5: "Does ground budget include airfare?", a5: "No. The ground budget is spend after arrival—food, lodging, transport, shopping; airfare should be added separately in the Travel Budget Calculator.",
    q6: "Can this tool replace expense tracking?", a6: "No. It is a quick estimate for planning; formal spend should rely on actual expense tracking and daily detail.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function comfortTarget(mode: TierMode): number {
  if (mode === "thrifty") return 2000;
  if (mode === "comfort") return 6000;
  return 3500;
}

export default function DailyBudgetCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("7");
  const [tdee, setTdee] = useState("28000");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const days = Number(weight);
    const groundBudget = Number(tdee);
    if (days <= 0 || groundBudget <= 0) return null;
    const dailySpend = groundBudget / days;
    const sharePct = (dailySpend / comfortTarget(goal)) * 100;
    return { days, groundBudget, dailySpend, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.dailySpend, 0) : "—";
  const carbDisplay = result ? fmt(result.dailySpend, 0) : "—";
  const totalDisplay = result ? fmt(result.dailySpend, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("7"); setTdee("28000"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("7"); setTdee("28000"); setGoal("comfort"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "thrifty" ? "🟢" : goal === "comfort" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">4000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">4000</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="thrifty">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="comfort">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="daily-budget-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.dailySpend, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "DailySpend", note: t.bmrStep }, { label: "ComfortShare", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Lodging", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="daily-budget-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
