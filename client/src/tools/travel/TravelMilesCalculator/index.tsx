// @profile B
// Profile B · 旅行-工具 · TravelMilesCalculator（GOLD-STANDARD-001 compatible）

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

const VALUE_RATE = 0.015;

type FareTier = "economy" | "business" | "first";
const FARE_MULTIPLIER: Record<string, number> = { economy: 1.0, business: 1.5, first: 2.0 };

const bands = [
  { key: "distance", range: "miles", label: { zh: "飛行距離", en: "Distance" }, desc: { zh: "多數常旅客計畫以實際飛行距離（英里）為里程累積基礎,距離越長累積的基礎里程越多。", en: "Most frequent-flyer programs base mileage on actual flight distance in miles \u2014 longer flights earn more base miles." } },
  { key: "fare", range: "1.0-2.0x", label: { zh: "艙等乘數", en: "Fare multiplier" }, desc: { zh: "高艙等與高票價艙位常享有里程加成,經濟艙約 1.0、商務艙 1.5、頭等艙 2.0 是常見的加權範圍。", en: "Higher cabins and fare classes often earn bonus miles; ~1.0 economy, 1.5 business, 2.0 first is a common weighting range." } },
  { key: "value", range: "$0.01-0.02", label: { zh: "兌換比率", en: "Redemption rate" }, desc: { zh: "里程價值因兌換方式而異,一般約每里程 $0.01-0.02,兌換高價值艙位時每里程價值可能更高。", en: "Mile value varies by redemption; typically ~$0.01-0.02 per mile, and redeeming premium cabins can yield higher value." } },
  { key: "elite", range: "status", label: { zh: "會員等級", en: "Elite status" }, desc: { zh: "高階會員常享額外里程加成與優先權益;累積足夠里程或航段可升等,進一步提高每趟飛行的回饋。", en: "Elite members often get bonus miles and perks; enough miles or segments upgrade status, further boosting per-flight rewards." } },
  { key: "value-usd", range: "miles x rate", label: { zh: "里程價值", en: "Mile value" }, desc: { zh: "里程價值（美元）= 累積里程 × 兌換比率;用來把抽象的里程數轉換成可比較的實際金錢價值。", en: "Mile value (USD) = miles x redemption rate, converting abstract miles into a comparable real money value." } },
  { key: "estimate", range: "average", label: { zh: "平均估算", en: "Average estimate" }, desc: { zh: "本工具為平均估算,實際累積與價值因航空公司、艙位代碼與促銷而異,僅供哩程規劃參考。", en: "This is an average estimate; actual earnings and value vary by airline, fare code, and promotions \u2014 for mileage planning only." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "航班碳排放計算機", en: "Flight Carbon" }, href: "/tools/travel/flight-carbon-calculator" },
  { label: { zh: "旅行預算計算機", en: "Trip Budget" }, href: "/tools/travel/trip-budget-calculator" },
  { label: { zh: "時差計算機", en: "Jet Lag" }, href: "/tools/travel/jet-lag-calculator" },
  { label: { zh: "行李費計算機", en: "Baggage Fee" }, href: "/tools/travel/baggage-fee-calculator" },
];

const ui = {
  zh: {
    badge: "旅行 · 旅行里程 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Miles Calculator · 旅行里程計算機", subtitle: "依飛行距離與艙等估算累積里程、里程價值（美元）與可兌換獎勵",
    intro: "本工具把您輸入的飛行距離,乘上艙等乘數,即時估算可累積的常旅客里程,並依平均兌換比率換算成里程價值（美元）,協助您評估這趟飛行的哩程回饋與規劃獎勵兌換。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以一般里程加成與兌換比率（每里程約 $0.015）估算,屬哩程規劃參考;實際累積里程因航空公司、艙位代碼、會員等級與促銷而異,兌換價值也隨兌換方式波動,正式數字請以各常旅客計畫官網為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例距離即時估算", examplePreview: "累積里程", examplePerson: "里程價值", flowDemo: "乘數", fillExample: "載入範例 · 經濟", previewActivePath: "載入範例 · 商務",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入飛行距離與艙等", examplesHelper: "先用範例了解里程累積與價值的量級,再輸入您自己的飛行距離與艙等,即可得到累積里程、里程價值與可兌換獎勵的概念。",
    metric: "經濟艙", imperial: "商務艙", exampleCards: "範例卡", baselineExample: "範例 · 經濟", activeExample: "範例 · 商務", calculator: "計算器",
    modeLabel: "艙等", countLabel: "飛行距離（英里）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果", rateLabel: "兌換比率：每里程",
    resultCard: "旅行里程結果", estimatedTdee: "累積里程", monthlyEquiv: "價值", weeklyEquiv: "乘數", dailyEquiv: "里程價值", effectiveHours: "可兌換", fatLossTarget: "距離",
    outputLabel: "旅行里程分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格旅行里程結構矩陣", tdeeMatrixNote: "L7 固定六格,列出影響里程累積與價值的各項因子;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把里程估算整合進獎勵兌換規劃", conversionNote: "L9 會連動目前計算結果,顯示累積里程、里程價值與乘數,協助您判斷哪種艙位的哩程回饋較划算與何時兌換最有價值。",
    progressInsight: "進度洞察卡", possibleTarget: "目前航班計算", dailyGap: "累積里程", weeklyTrend: "距離", motivation: "動力卡", keepMomentum: "從單趟估算走向年度哩程累積與兌換管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次估算帶進您的哩程帳本", journeyHint: "每次規劃新航班時重新計算,並把累積里程記錄到年度哩程表,做為獎勵兌換與升等規劃的依據。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用航班碳排放計算機評估這趟飛行的環境影響", nextActionItem2: "用旅行預算計算機規劃含里程折抵的旅費", nextActionItem3: "用時差計算機安排長程航班的作息調整",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸距離 → 乘艙等 → 得里程 → 換價值", bmrStep: "輸距離", deficitStep: "乘艙等", trendStep: "得里程", mealStep: "換價值",
    knowledge: "知識", knowledgeTitle: "旅行里程與里程價值的意義", definition: "定義", definitionText: "旅行里程是常旅客計畫對飛行給予的回饋點數,通常以飛行距離為基礎並依艙等加成;累積足夠里程可兌換機票、升等或其他獎勵,里程價值則是把里程換算成美元的概念。",
    formula: "公式", formulaText: "累積里程 = 飛行距離（英里）× 艙等乘數;里程價值（美元）= 累積里程 × 兌換比率;一般兌換比率約每里程 $0.01-0.02。",
    limitations: "限制", limitationsText: "本工具以一般加成與比率估算,屬規劃參考;實際里程因航空公司、艙位代碼、會員等級與促銷而異,部分計畫改以票價而非距離累積,正式數字以各計畫官網為準。",
    interpretation: "解讀", interpretationText: "里程價值每里程約 $0.01-0.02,兌換高價值艙位時可能更高;高艙等乘數較高累積更快,但需比較票價差額是否值得,選擇兌換時機亦影響每里程實際價值。",
    context: "脈絡", contextText: "了解里程累積與價值有助於選擇回饋較高的艙位與航空公司、規劃升等門檻,並在里程價值最高時兌換,讓每趟飛行的哩程回饋發揮最大效益。",
    example: "範例", exampleText: "飛行距離 2000 英里、經濟艙乘數 1.0,累積里程約 2000,以每里程 $0.015 換算,里程價值約 $30。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "旅行規劃工作流程的下一步工具", premiumTitle: "專業版哩程規劃工具包", premiumText: "解鎖各航空公司精細累積率、艙位代碼對照、會員升等門檻追蹤與最佳兌換時機建議報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做里程累積與價值估算,屬規劃參考;不構成兌換保證,精確數字以各常旅客計畫官網為準。", relatedTools: "相關工具", relatedToolsText: "航班碳排放計算機 · 旅行預算計算機 · 時差計算機 · 行李費計算機", references: "參考資料", referencesText: "常旅客計畫里程累積與艙等加成原則;里程兌換價值估算;會員等級與升等門檻;哩程規劃概念。",
    q1: "旅行里程怎麼算？", a1: "累積里程 = 飛行距離 × 艙等乘數;多數計畫以實際飛行英里數為基礎,高艙等享加成,部分計畫已改以票價累積,實際以各計畫規則為準。",
    q2: "里程值多少錢？", a2: "里程價值因兌換方式而異,一般約每里程 $0.01-0.02;兌換高價值的商務或頭等艙票時,每里程的實際價值通常會高於兌換經濟艙或商品。",
    q3: "商務艙里程比較多嗎？", a3: "通常是的,高艙等與高票價艙位常享里程加成,本工具以經濟艙 1.0、商務艙 1.5、頭等艙 2.0 估算;但需比較票價差額是否值得多累積的里程。",
    q4: "為什麼每次結果不同？", a4: "飛行距離與艙等不同,結果自然不同;這很正常,建議依實際航線英里數與艙等輸入,才能得到貼近真實的里程累積與價值估算。",
    q5: "怎麼讓里程更有價值？", a5: "可選擇回饋較高的艙位與航空公司、累積到升等門檻享加成,並在里程價值最高（通常是兌換高艙位）時兌換,避免讓里程貶值或過期。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有距離與里程計算都在您的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "Travel · Travel Miles · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Travel Miles Calculator", subtitle: "Estimate miles earned, mile value (USD), and redeemable rewards by distance and cabin",
    intro: "This tool takes the flight distance you enter, multiplies it by the fare multiplier, and instantly estimates the frequent-flyer miles you can earn, then converts them into a mile value (USD) by an average redemption rate, helping you assess a flight's mileage rewards and plan redemptions. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates with general mileage bonuses and a redemption rate (~$0.015 per mile) and is a mileage-planning reference; actual miles vary by airline, fare code, status, and promotions, and value fluctuates by redemption \u2014 confirm on each program's site. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample distance and estimate", examplePreview: "Miles earned", examplePerson: "Mile value", flowDemo: "Multiplier", fillExample: "Load sample · economy", previewActivePath: "Load sample · business",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter flight distance and cabin", examplesHelper: "Start with a sample to grasp the scale of mile earning and value, then enter your own distance and cabin to get miles earned, mile value, and a sense of redeemable rewards.",
    metric: "Economy", imperial: "Business", exampleCards: "Example cards", baselineExample: "Sample · economy", activeExample: "Sample · business", calculator: "Calculator",
    modeLabel: "Cabin", countLabel: "Flight distance (miles)", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis", rateLabel: "Redemption rate per mile:",
    resultCard: "Travel miles result", estimatedTdee: "Miles earned", monthlyEquiv: "Value", weeklyEquiv: "Multiplier", dailyEquiv: "Mile value", effectiveHours: "Redeemable", fatLossTarget: "Distance",
    outputLabel: "Travel miles summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band travel-miles structure matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 lists factors affecting mile earning and value. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit mile estimation into reward-redemption planning", conversionNote: "L9 reflects your current calculation \u2014 miles earned, mile value, and multiplier \u2014 to help you decide which cabin's rewards are worthwhile and when redemption is most valuable.",
    progressInsight: "Progress insight", possibleTarget: "Your current flight calc", dailyGap: "Miles earned", weeklyTrend: "Distance", motivation: "Motivation", keepMomentum: "Move from a single trip to annual mileage and redemption management",
    saveShareJourney: "Save / share", journeyTitle: "Take this estimate into your mileage ledger", journeyHint: "Recompute whenever you plan a new flight, and log miles into an annual mileage sheet as a basis for redemptions and status planning.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Flight Carbon Calculator to assess this flight's environmental impact", nextActionItem2: "Use the Trip Budget Calculator to plan costs offset by miles", nextActionItem3: "Use the Jet Lag Calculator to plan rest for a long-haul flight",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Distance → x Cabin → Miles → Value", bmrStep: "Distance", deficitStep: "Cabin", trendStep: "Miles", mealStep: "Value",
    knowledge: "Knowledge", knowledgeTitle: "What travel miles and mile value mean", definition: "Definition", definitionText: "Travel miles are reward points a frequent-flyer program grants for flying, usually based on distance with a cabin bonus; enough miles redeem flights, upgrades, or other rewards, and mile value is the concept of converting miles into dollars.",
    formula: "Formula", formulaText: "Miles earned = flight distance (miles) x fare multiplier; mile value (USD) = miles x redemption rate; a typical rate is ~$0.01-0.02 per mile.",
    limitations: "Limitations", limitationsText: "This tool estimates with general bonuses and rates and is a planning reference; actual miles vary by airline, fare code, status, and promotions, and some programs earn on fare not distance \u2014 each program's site governs.",
    interpretation: "Interpretation", interpretationText: "Mile value is ~$0.01-0.02 per mile, higher when redeeming premium cabins; higher cabins earn faster, but compare the fare difference, and redemption timing also affects real per-mile value.",
    context: "Context", contextText: "Knowing mile earning and value helps choose higher-reward cabins and airlines, plan status thresholds, and redeem when value peaks, maximizing the mileage rewards of each flight.",
    example: "Example", exampleText: "Distance 2000 miles, economy multiplier 1.0: miles earned ~2000, valued at ~$0.015 per mile gives a mile value of ~$30.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a travel-planning workflow", premiumTitle: "Pro Mileage Planning Toolkit", premiumText: "Unlock airline-specific earning rates, fare-code mapping, status-threshold tracking, and best-redemption-timing recommendation reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only estimates mile earning and value and is a planning reference; it is not a redemption guarantee \u2014 use each program's official site for precise figures.", relatedTools: "Related tools", relatedToolsText: "Flight Carbon Calculator · Trip Budget Calculator · Jet Lag Calculator · Baggage Fee Calculator", references: "References", referencesText: "Frequent-flyer mile earning and cabin-bonus principles; mile redemption value estimation; status tiers and upgrade thresholds; mileage-planning concepts.",
    q1: "How are travel miles calculated?", a1: "Miles earned = distance x fare multiplier; most programs base it on actual flight miles with cabin bonuses, while some now earn on fare \u2014 each program's rules govern.",
    q2: "How much is a mile worth?", a2: "Mile value varies by redemption, typically ~$0.01-0.02 per mile; redeeming premium business or first cabins usually yields higher per-mile value than economy or merchandise.",
    q3: "Does business class earn more miles?", a3: "Usually yes \u2014 higher cabins and fare classes often earn bonus miles; this tool estimates ~1.0 economy, 1.5 business, 2.0 first, but compare the fare difference against the extra miles.",
    q4: "Why does each result differ?", a4: "Distance and cabin differ, so results differ; this is normal \u2014 enter the real route miles and cabin to get an earning and value estimate close to actual.",
    q5: "How do I maximize mile value?", a5: "Choose higher-reward cabins and airlines, reach status thresholds for bonuses, and redeem when value peaks (often premium cabins), avoiding devaluation or expiry.",
    q6: "Does this tool upload my data?", a6: "No. All distance and mile calculations run locally in your browser \u2014 the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function TravelMilesCalculator() {
  const { lang, setLang } = useLanguage();
  const [tier, setTier] = useState<FareTier>("economy");
  const [distance, setDistance] = useState("2000");
  const t = ui[lang];

  const result = useMemo(() => {
    const d = Math.max(0, Number(distance) || 0);
    const multiplier = FARE_MULTIPLIER[tier];
    const miles = d * multiplier;
    const value = miles * VALUE_RATE;
    return { miles, value, multiplier, distance: d };
  }, [tier, distance]);

  const verdict = useMemo<LocalText>(() => {
    if (result.miles >= 10000) return { zh: "豐厚回饋 🏆", en: "Big rewards 🏆" };
    if (result.miles >= 3000) return { zh: "不錯回饋 ✅", en: "Solid ✅" };
    if (result.miles > 0) return { zh: "少量里程 ✈️", en: "Some miles ✈️" };
    return { zh: "請輸入距離", en: "Enter distance" };
  }, [result.miles]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "累積里程", en: "Miles earned" }, `${fmt(result.miles)}`],
      [{ zh: "里程價值", en: "Mile value" }, `$${result.value.toFixed(2)}`],
      [{ zh: "艙等乘數", en: "Multiplier" }, `${result.multiplier.toFixed(1)}x`],
      [{ zh: "飛行距離", en: "Distance" }, `${fmt(result.distance)} mi`],
      [{ zh: "兌換比率", en: "Rate" }, `$${VALUE_RATE.toFixed(3)}`],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setTier("economy"); setDistance("2000"); }
  function fillHighSalary() { setTier("business"); setDistance("8000"); }

  const activeBand = bands.find(b => b.key === (tier === "economy" ? "distance" : tier === "business" ? "fare" : "value-usd")) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fmt(result.miles)}</div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyEquiv}</div><div className="font-black">${result.value.toFixed(1)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{result.multiplier.toFixed(1)}x</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.distance)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "economy" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("economy")}>{lang === "zh" ? "經濟艙" : "Economy"}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "business" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("business")}>{lang === "zh" ? "商務艙" : "Business"}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "first" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("first")}>{lang === "zh" ? "頭等艙" : "First"}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">2000mi</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "經濟艙 · 乘數 1.0" : "Economy · 1.0x"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">8000mi</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "商務艙 · 乘數 1.5" : "Business · 1.5x"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={distance} onChange={(e) => setDistance(e.target.value)} /></label><div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{t.rateLabel} ${VALUE_RATE.toFixed(3)}</div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{fmt(result.miles)}<span className="text-2xl">{lang === "zh" ? " 里程" : " mi"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.dailyEquiv}</div><div className="mt-1 text-xl font-black">${result.value.toFixed(0)}</div><div className="mt-1 text-xs text-slate-300">{result.multiplier.toFixed(1)}x</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">USD</div><p className="mt-2 text-3xl font-black text-emerald-950">${result.value.toFixed(0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "里程價值" : "value"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">cabin</div><p className="mt-2 text-3xl font-black text-blue-950">{result.multiplier.toFixed(1)}x</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "乘數" : "multiplier"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.fatLossTarget}</div><div className="mt-1 text-xs font-black text-slate-700">mi</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.distance)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="travel-miles-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "判定" : "Verdict"}</div><div className="mt-1 text-2xl font-black">{l(verdict, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{fmt(result.distance)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.miles)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸距離" : "Distance", note: t.bmrStep }, { label: lang === "zh" ? "乘艙等" : "Cabin", note: t.deficitStep }, { label: lang === "zh" ? "得里程" : "Miles", note: t.trendStep }, { label: lang === "zh" ? "換價值" : "Value", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="travel-miles-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["累積率", "艙位", "升等", "兌換"] : ["Rates", "Fare", "Status", "Redeem"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
