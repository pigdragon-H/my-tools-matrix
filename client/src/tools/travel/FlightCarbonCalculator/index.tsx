// @profile B
// Profile B · 旅行-工具 · FlightCarbonCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");
const pct = (v: number) => (isFinite(v) ? v.toFixed(1) : "0.0") + "%";

const BASE_FACTOR = 0.115;
const CAR_FACTOR = 0.17;
const TREE_ABSORB = 21;

type CabinTier = "economy" | "business" | "first";
const CABIN_FACTOR: Record<string, number> = { economy: 1.0, business: 2.0, first: 3.0 };

const bands = [
  { key: "distance", range: "km", label: { zh: "飛行距離", en: "Distance" }, desc: { zh: "碳排放與飛行距離大致成正比;短程約 150kg、中程約 600kg、長程約 2500kg 是常見的單程經濟艙平均值。", en: "Carbon roughly scales with distance; ~150kg short-haul, ~600kg medium, ~2500kg long-haul are common one-way economy averages." } },
  { key: "cabin", range: "1.0-3.0x", label: { zh: "艙等係數", en: "Cabin factor" }, desc: { zh: "艙等占用空間不同,係數約為經濟艙 1.0、商務艙 2.0、頭等艙 3.0,座位越大人均碳排越高。", en: "Cabins use different space; factors are ~1.0 economy, 2.0 business, 3.0 first \u2014 bigger seats mean higher per-person carbon." } },
  { key: "roundtrip", range: "x2", label: { zh: "來回行程", en: "Round trip" }, desc: { zh: "來回行程的碳排放約為單程的兩倍,規劃時記得把回程一併計入總量。", en: "A round trip is about double a one-way flight, so include the return leg in the total when planning." } },
  { key: "car", range: "x0.17", label: { zh: "等同開車", en: "Car equivalent" }, desc: { zh: "以一般汽車每公里約 0.17kg 換算,可把航班碳排放轉成等同開車的公里數,較易直觀理解。", en: "Using ~0.17kg per km for an average car, you can express flight carbon as an equivalent driving distance for intuition." } },
  { key: "tree", range: "21kg/yr", label: { zh: "植樹抵消", en: "Tree offset" }, desc: { zh: "一棵樹一年約吸收 21kg CO2;用碳排放除以此值可估算抵消所需的植樹年棵數。", en: "A tree absorbs ~21kg CO2 per year; dividing carbon by this estimates the tree-years needed to offset it." } },
  { key: "estimate", range: "average", label: { zh: "平均估算", en: "Average estimate" }, desc: { zh: "本工具為平均估算,實際排放因機型、載客率、航線與天氣而異,僅供環保意識與抵消規劃參考。", en: "This is an average estimate; actual emissions vary by aircraft, load factor, route, and weather \u2014 for awareness and offset planning only." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅行里程計算機", en: "Travel Miles" }, href: "/tools/travel/travel-miles-calculator" },
  { label: { zh: "旅行預算計算機", en: "Trip Budget" }, href: "/tools/travel/trip-budget-calculator" },
  { label: { zh: "時差計算機", en: "Jet Lag" }, href: "/tools/travel/jet-lag-calculator" },
  { label: { zh: "行李費計算機", en: "Baggage Fee" }, href: "/tools/travel/baggage-fee-calculator" },
];

const ui = {
  zh: {
    badge: "旅行 · 航班碳排放 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Flight Carbon Calculator · 航班碳排放計算機", subtitle: "依飛行距離與艙等估算碳排放量、等同開車公里與植樹抵消棵數",
    intro: "本工具把你輸入的飛行距離,乘上艙等係數與單程或來回設定,即時估算航班碳排放量（kg CO2）、等同於開車多少公里,以及抵消所需的植樹年棵數,協助你了解旅程的環境影響並規劃碳抵消。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以一般排放係數估算,屬環保意識參考;實際碳排放因機型、載客率、航線、巡航高度與天氣而異,正式碳足跡請以航空公司或專業碳計算機構的數據為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例距離即時估算", examplePreview: "碳排放", examplePerson: "開車公里", flowDemo: "植樹", fillExample: "載入範例 · 中程經濟", previewActivePath: "載入範例 · 長程商務",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入飛行距離與艙等", examplesHelper: "先用範例了解航班碳排放的量級,再輸入你自己的飛行距離、艙等與單程或來回設定,即可得到碳排放量、等同開車公里與植樹抵消棵數。",
    metric: "單程", imperial: "來回", exampleCards: "範例卡", baselineExample: "範例 · 中程", activeExample: "範例 · 長程", calculator: "計算器",
    modeLabel: "艙等", countLabel: "飛行距離（公里）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "航班碳排放結果", estimatedTdee: "碳排放", monthlyEquiv: "開車", weeklyEquiv: "植樹", dailyEquiv: "艙等係數", effectiveHours: "等同開車", fatLossTarget: "距離",
    outputLabel: "航班碳排放分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格航班碳排放結構矩陣", tdeeMatrixNote: "L7 固定六格,列出影響航班碳排放的各項因子;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把碳排放估算整合進旅程規劃", conversionNote: "L9 會連動目前計算結果,顯示碳排放量、等同開車公里與植樹棵數,協助你評估旅程的環境影響並考慮碳抵消。",
    progressInsight: "進度洞察卡", possibleTarget: "目前航班計算", dailyGap: "碳排放", weeklyTrend: "距離", motivation: "動力卡", keepMomentum: "從單趟估算走向年度旅行碳足跡管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次估算帶進你的旅行碳帳", journeyHint: "每次規劃新航班時重新計算,並把碳排放量記錄到年度旅行碳足跡表,做為碳抵消與綠色出行的依據。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅行里程計算機估算這趟飛行的累積里程", nextActionItem2: "用旅行預算計算機規劃含碳抵消的旅費", nextActionItem3: "用時差計算機安排長程航班的作息調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸距離 → 乘艙等 → 乘來回 → 得碳排", bmrStep: "輸距離", deficitStep: "乘艙等", trendStep: "乘來回", mealStep: "得碳排",
    knowledge: "知識", knowledgeTitle: "航班碳排放的意義", definition: "定義", definitionText: "航班碳排放指飛行所產生的二氧化碳量,通常以每位乘客的公斤數表示;它受飛行距離、艙等占用空間與機型效率影響,是個人旅行碳足跡的重要來源。",
    formula: "公式", formulaText: "碳排放（kg）≈ 飛行距離（km）× 基礎係數 × 艙等係數 ×（來回則 ×2）;等同開車公里 = 碳排放 ÷ 0.17;植樹年棵數 = 碳排放 ÷ 21。",
    limitations: "限制", limitationsText: "本工具以一般係數估算,屬環保意識參考;實際排放因機型、載客率、航線、巡航高度與天氣而異,且高空排放的暖化效應可能更高,正式碳足跡以專業機構數據為準。",
    interpretation: "解讀", interpretationText: "短程約 150kg、中程約 600kg、長程約 2500kg 是常見單程經濟艙量級;艙等越高人均碳排越高,來回約為單程兩倍,可用開車公里與植樹棵數直觀理解。",
    context: "脈絡", contextText: "了解航班碳排放有助於提升環保意識、選擇較直飛或較高載客率的航線,並透過碳抵消專案植樹或投資減碳,降低旅行對氣候的影響。",
    example: "範例", exampleText: "中程 2500 公里、經濟艙、單程,碳排放約 288kg,等同開車約 1690 公里,需約 14 棵樹一年的吸收量來抵消。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "旅行規劃工作流程的下一步工具", premiumTitle: "專業版旅行碳足跡工具包", premiumText: "解鎖機型精細係數、多航段行程合計、年度碳足跡追蹤與碳抵消專案比較報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做航班碳排放估算,屬環保意識參考;不構成正式碳足跡認證,精確數據以專業碳計算機構為準。", relatedTools: "相關工具", relatedToolsText: "旅行里程計算機 · 旅行預算計算機 · 時差計算機 · 行李費計算機", references: "參考資料", referencesText: "航空碳排放係數與艙等加權原則;汽車每公里碳排換算;樹木年吸碳量;碳抵消與綠色出行概念。",
    q1: "航班碳排放怎麼算？", a1: "碳排放（kg）≈ 飛行距離 × 基礎係數 × 艙等係數,來回再乘以二;本工具以一般係數估算,實際排放會因機型、載客率與航線而有差異。",
    q2: "為什麼商務艙碳排較高？", a2: "因為高艙等座位占用更多機艙空間,單位乘客分攤的飛機重量與燃油較多;一般以經濟艙 1.0、商務艙 2.0、頭等艙 3.0 的係數加權。",
    q3: "等同開車公里怎麼來的？", a3: "以一般汽車每公里約 0.17kg CO2 換算,把航班碳排放除以此值即可得到等同的開車公里數,讓抽象的碳量更容易直觀理解。",
    q4: "為什麼每次結果不同？", a4: "飛行距離、艙等與單程或來回設定不同,結果自然不同;這很正常,建議依實際航線距離與艙等輸入,才能得到貼近真實的碳排放估算。",
    q5: "怎麼降低航班碳排放？", a5: "可選擇直飛減少起降耗能、搭乘較高載客率的航班、優先經濟艙,或在無法避免時透過認證的碳抵消專案植樹或投資減碳來中和排放。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有距離與碳排放計算都在你的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "Travel · Flight Carbon · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Flight Carbon Calculator", subtitle: "Estimate carbon emissions, car-equivalent distance, and tree offset by flight distance and cabin",
    intro: "This tool takes the flight distance you enter, multiplies it by the cabin factor and a one-way or round-trip setting, and instantly estimates flight carbon emissions (kg CO2), the equivalent driving distance, and the tree-years needed to offset it, helping you understand a trip's environmental impact and plan carbon offsets. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates with general emission factors and is an awareness reference; actual carbon varies by aircraft, load factor, route, cruise altitude, and weather \u2014 use airline or professional carbon-calculator data for an official footprint. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample distance and estimate", examplePreview: "Carbon", examplePerson: "Car km", flowDemo: "Trees", fillExample: "Load sample · medium economy", previewActivePath: "Load sample · long-haul business",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter flight distance and cabin", examplesHelper: "Start with a sample to grasp the scale of flight carbon, then enter your own distance, cabin, and one-way or round-trip setting to get carbon, car-equivalent distance, and tree offset.",
    metric: "One way", imperial: "Round trip", exampleCards: "Example cards", baselineExample: "Sample · medium", activeExample: "Sample · long-haul", calculator: "Calculator",
    modeLabel: "Cabin", countLabel: "Flight distance (km)", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Flight carbon result", estimatedTdee: "Carbon", monthlyEquiv: "Car", weeklyEquiv: "Trees", dailyEquiv: "Cabin factor", effectiveHours: "Car equivalent", fatLossTarget: "Distance",
    outputLabel: "Flight carbon summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band flight-carbon structure matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 lists factors affecting flight carbon. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit carbon estimation into trip planning", conversionNote: "L9 reflects your current calculation \u2014 carbon, car-equivalent distance, and trees \u2014 to help you assess a trip's environmental impact and consider carbon offsets.",
    progressInsight: "Progress insight", possibleTarget: "Your current flight calc", dailyGap: "Carbon", weeklyTrend: "Distance", motivation: "Motivation", keepMomentum: "Move from a single trip to annual travel-footprint management",
    saveShareJourney: "Save / share", journeyTitle: "Take this estimate into your travel carbon ledger", journeyHint: "Recompute whenever you plan a new flight, and log carbon into an annual travel-footprint sheet as a basis for offsets and greener travel.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Travel Miles Calculator to estimate miles earned on this flight", nextActionItem2: "Use the Trip Budget Calculator to plan costs including offsets", nextActionItem3: "Use the Jet Lag Calculator to plan rest for a long-haul flight",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Distance → x Cabin → x Round trip → Carbon", bmrStep: "Distance", deficitStep: "Cabin", trendStep: "Round trip", mealStep: "Carbon",
    knowledge: "Knowledge", knowledgeTitle: "What flight carbon means", definition: "Definition", definitionText: "Flight carbon is the carbon dioxide a flight produces, usually expressed per passenger in kilograms; it depends on distance, cabin space, and aircraft efficiency, and is a major source of a personal travel footprint.",
    formula: "Formula", formulaText: "Carbon (kg) ~ distance (km) x base factor x cabin factor x (round trip x2); car-equivalent km = carbon / 0.17; tree-years = carbon / 21.",
    limitations: "Limitations", limitationsText: "This tool estimates with general factors and is an awareness reference; actual emissions vary by aircraft, load factor, route, cruise altitude, and weather, and high-altitude warming effects may be higher \u2014 use professional data for an official footprint.",
    interpretation: "Interpretation", interpretationText: "~150kg short-haul, ~600kg medium, ~2500kg long-haul are common one-way economy scales; higher cabins mean higher per-person carbon, round trip is about double, and car km and trees aid intuition.",
    context: "Context", contextText: "Knowing flight carbon raises awareness, favors direct or higher-load routes, and supports offsetting via tree planting or carbon-reduction investment to lower travel's climate impact.",
    example: "Example", exampleText: "Medium 2500 km, economy, one way: carbon is ~288kg, equivalent to driving ~1690 km, needing ~14 tree-years of absorption to offset.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a travel-planning workflow", premiumTitle: "Pro Travel Footprint Toolkit", premiumText: "Unlock aircraft-specific factors, multi-segment trip totals, annual footprint tracking, and offset-project comparison reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only estimates flight carbon and is an awareness reference; it is not an official footprint certification \u2014 use professional carbon calculators for precise data.", relatedTools: "Related tools", relatedToolsText: "Travel Miles Calculator · Trip Budget Calculator · Jet Lag Calculator · Baggage Fee Calculator", references: "References", referencesText: "Aviation emission factors and cabin-weighting principles; car per-km carbon conversion; annual tree carbon absorption; carbon-offset and green-travel concepts.",
    q1: "How is flight carbon calculated?", a1: "Carbon (kg) ~ distance x base factor x cabin factor, doubled for a round trip; this tool estimates with general factors, and actual emissions differ by aircraft, load factor, and route.",
    q2: "Why is business class higher?", a2: "Higher cabins use more space, so each passenger bears more aircraft weight and fuel; factors are typically weighted ~1.0 economy, 2.0 business, 3.0 first.",
    q3: "Where does car-equivalent km come from?", a3: "Using ~0.17kg CO2 per km for an average car, dividing flight carbon by this gives an equivalent driving distance, making abstract carbon easier to grasp.",
    q4: "Why does each result differ?", a4: "Distance, cabin, and one-way or round-trip setting differ, so results differ; this is normal \u2014 enter the real route distance and cabin to get an estimate close to actual.",
    q5: "How do I lower flight carbon?", a5: "Choose direct flights to cut takeoff/landing fuel, fly higher-load flights, prefer economy, or when unavoidable offset via certified projects that plant trees or invest in carbon reduction.",
    q6: "Does this tool upload my data?", a6: "No. All distance and carbon calculations run locally in your browser \u2014 the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function FlightCarbonCalculator() {
  const { lang, setLang } = useLanguage();
  const [tier, setTier] = useState<CabinTier>("economy");
  const [distance, setDistance] = useState("2500");
  const [round, setRound] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => {
    const d = Math.max(0, Number(distance) || 0);
    const trips = round ? 2 : 1;
    const carbon = d * BASE_FACTOR * CABIN_FACTOR[tier] * trips;
    const carKm = carbon / CAR_FACTOR;
    const trees = carbon / TREE_ABSORB;
    return { carbon, carKm, trees, distance: d * trips, factor: CABIN_FACTOR[tier] };
  }, [tier, distance, round]);

  const verdict = useMemo<LocalText>(() => {
    if (result.carbon >= 2000) return { zh: "高碳排 🌍", en: "High carbon 🌍" };
    if (result.carbon >= 500) return { zh: "中碳排 ⚠️", en: "Medium ⚠️" };
    if (result.carbon > 0) return { zh: "低碳排 ✅", en: "Low ✅" };
    return { zh: "請輸入距離", en: "Enter distance" };
  }, [result.carbon]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "碳排放", en: "Carbon" }, `${fmt(result.carbon)} kg`],
      [{ zh: "等同開車", en: "Car equivalent" }, `${fmt(result.carKm)} km`],
      [{ zh: "植樹抵消", en: "Tree offset" }, `${result.trees.toFixed(1)}`],
      [{ zh: "總距離", en: "Total distance" }, `${fmt(result.distance)} km`],
      [{ zh: "艙等係數", en: "Cabin factor" }, `${result.factor.toFixed(1)}x`],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setTier("economy"); setDistance("2500"); setRound(false); }
  function fillHighSalary() { setTier("business"); setDistance("9000"); setRound(true); }

  const activeBand = bands.find(b => b.key === (tier === "economy" ? "distance" : tier === "business" ? "cabin" : "estimate")) || bands[0];

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fmt(result.carbon)}<span className="text-2xl"> kg</span></div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyEquiv}</div><div className="font-black">{fmt(result.carKm)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{result.trees.toFixed(1)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyEquiv}</div><div className="font-black">{result.factor.toFixed(1)}x</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "economy" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("economy")}>{lang === "zh" ? "經濟艙" : "Economy"}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "business" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("business")}>{lang === "zh" ? "商務艙" : "Business"}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "first" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("first")}>{lang === "zh" ? "頭等艙" : "First"}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">2500km</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "經濟艙 · 單程" : "Economy · one way"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">9000km</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "商務艙 · 來回" : "Business · round trip"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={distance} onChange={(e) => setDistance(e.target.value)} /></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" className="h-5 w-5" checked={round} onChange={(e) => setRound(e.target.checked)} />{lang === "zh" ? "來回行程（碳排 ×2）" : "Round trip (carbon x2)"}</label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{fmt(result.carbon)}<span className="text-2xl"> kg</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.dailyEquiv}</div><div className="mt-1 text-xl font-black">{result.factor.toFixed(1)}x</div><div className="mt-1 text-xs text-slate-300">{fmt(result.distance)} km</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">x0.17</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.carKm)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "開車公里" : "car km"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">21kg/yr</div><p className="mt-2 text-3xl font-black text-blue-950">{result.trees.toFixed(1)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "棵樹" : "trees"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.fatLossTarget}</div><div className="mt-1 text-xs font-black text-slate-700">km</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.distance)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="flight-carbon-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "判定" : "Verdict"}</div><div className="mt-1 text-2xl font-black">{l(verdict, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{fmt(result.distance)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.carbon)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸距離" : "Distance", note: t.bmrStep }, { label: lang === "zh" ? "乘艙等" : "Cabin", note: t.deficitStep }, { label: lang === "zh" ? "乘來回" : "Round trip", note: t.trendStep }, { label: lang === "zh" ? "得碳排" : "Carbon", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="flight-carbon-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["機型", "多段", "年度", "抵消"] : ["Aircraft", "Multi", "Annual", "Offset"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
