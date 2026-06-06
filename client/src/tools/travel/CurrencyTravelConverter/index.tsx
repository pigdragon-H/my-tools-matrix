// @profile B
// Profile B · Calculator-Travel · CurrencyTravelConverter（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "bank" | "card" | "cash";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 1%", label: { zh: "極低", en: "Very low" }, desc: { zh: "換匯成本極低，幾乎拿到市場中間價，最划算。", en: "Conversion cost is very low, near the mid-market rate—the best deal." } },
  { key: "low", range: "1–2%", label: { zh: "偏低", en: "Low" }, desc: { zh: "換匯成本偏低，屬優惠通路，可安心兌換。", en: "Low conversion cost; a favorable channel you can use with confidence." } },
  { key: "healthy", range: "2–3.5%", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數通路常見區間，成本可接受。", en: "Common channel band; the cost is acceptable." } },
  { key: "good", range: "3.5–5%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "換匯成本偏高，宜比較其他通路或卡別。", en: "Elevated conversion cost; compare other channels or card types." } },
  { key: "strong", range: "5–7%", label: { zh: "高", en: "High" }, desc: { zh: "成本明顯，建議改用低費率通路再兌換。", en: "Cost is notable; switch to a lower-fee channel before converting." } },
  { key: "elite", range: "> 7%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "換匯成本過高，務必避免，改用銀行或數位卡。", en: "Excessive conversion cost; avoid it and switch to a bank or digital card." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "旅遊價格比較器", en: "Travel Price Comparator" }, href: "/tools/travel/travel-price-comparator" },
  { label: { zh: "購買力平價計算機", en: "Purchasing Power Parity" }, href: "/tools/travel/purchasing-power-parity" },
];

const ui = {
  zh: {
    badge: "旅遊 · 貨幣換算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "旅遊貨幣換算器 · Currency Converter", subtitle: "用匯率、母國金額與換匯通路算出實收外幣金額與換匯成本比例",
    intro: "Travel Currency Converter 依據匯率、母國金額與換匯通路（銀行、刷卡或現鈔），計算扣除換匯費用後的實收外幣金額與換匯成本比例，協助你判斷哪個通路最划算、避免被高額手續費或差勁匯率吃掉旅費。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以名目匯率乘金額再扣通路費率估算，未含當下即時匯率波動與發卡行附加費；正式金額以銀行或刷卡帳單為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立換匯範例", examplePreview: "換匯預覽", examplePerson: "匯率 (×1000)", fillExample: "一鍵填入標準換匯範例", previewActivePath: "填入現鈔通路範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入匯率、母國金額與換匯通路", examplesHelper: "先用範例理解匯率與通路如何決定實收外幣與成本比例，再改成自己的兌換數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準刷卡模式", activeExample: "現鈔示範", baselineExampleNote: "匯率 32 · 金額 30000 · 刷卡", activeExampleNote: "匯率 32 · 金額 30000 · 現鈔", carbsLabel: "實收外幣", carbsName: "外幣", proteinLabel: "成本比", flowDemo: "母國金額", calculator: "計算機",
    weight: "匯率 (×1000)", tdee: "母國金額 (元)", goal: "換匯通路", goalCut: "銀行 (0.5%)", goalMaintain: "刷卡 (2.5%)", goalBulk: "現鈔 (6%)",
    resultCard: "換匯計算結果", unit: "外幣 (實收金額)", primaryValue: "主要數值", maintenanceTarget: "成本比", actionTarget: "實收外幣", estimatedTdee: "母國金額", maintenance: "%", fatLossTarget: "外幣",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格換匯成本判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前換匯成本比例放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把換匯結果轉成可執行的兌換策略", conversionNote: "L9 會連動目前計算結果，顯示成本比、實收外幣與母國金額提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前換匯概況", dailyGap: "成本比", weeklyTrend: "實收外幣", motivation: "動力卡", keepMomentum: "從換匯分析走向最划算的兌換通路",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的換匯結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，把換匯省下的成本用在體驗上。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算把實收外幣納入總花費", nextActionItem2: "用每日預算估算外幣的每日可用額", nextActionItem3: "用價格比較器確認跨幣別方案是否對等",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "母國金額 → 成本比 → 通路 → 預算", bmrStep: "母國金額", deficitStep: "成本比", trendStep: "通路", mealStep: "預算",
    knowledge: "知識", knowledgeTitle: "貨幣換算在行程規劃中的意義", definition: "定義", definitionText: "旅遊貨幣換算是把母國金額按匯率轉成外幣，再扣除通路費用後得到實收金額；換匯成本比例衡量手續費與差價對旅費的侵蝕，是選通路的核心指標。", formula: "公式", formulaText: "實收外幣 = 母國金額 × 匯率 ×（1 − 通路費率）。成本比 = 通路費率 × 100%（相對名目匯率的損耗）。", limitations: "限制", limitationsText: "本工具以名目匯率與固定通路費率估算；真實換匯還受即時匯率波動、發卡行附加費、提款機手續費與買賣價差影響，且各通路費率會變動。", interpretation: "解讀", interpretationText: "成本比越低越划算；銀行與數位卡通常低於現鈔。可比較不同通路、避開機場與旅館櫃台，並留意刷卡的海外手續費。", context: "脈絡", contextText: "換匯結果應與旅遊預算、每日花費與價格比較一起看，才能在匯率、費用與便利之間取得平衡。", example: "範例", exampleText: "匯率 32、刷卡（2.5%）、母國金額 30000 → 實收外幣約 936，換匯成本比 2.5%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "換匯的下一步工具", premiumTitle: "PRO 換匯分析包", premiumText: "解鎖即時匯率串接、多通路費率比對、發卡行附加費試算與買賣價差報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代銀行報價、發卡行條款或專業財務建議。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Daily Budget · Price Comparator · PPP", references: "參考資料", referencesText: "各國央行參考匯率；發卡組織海外費率；數位銀行換匯費率；旅遊換匯研究。",
    q1: "實收外幣怎麼算的？", a1: "本工具以母國金額乘匯率再扣通路費率估算；實際金額還受即時匯率波動與發卡行附加費影響。",
    q2: "成本比多少合理？", a2: "依通路而定，2–3.5% 多屬可接受；超過 7% 表示換匯成本過高，宜改用銀行或數位卡。",
    q3: "刷卡、現鈔還是銀行？", a3: "小額消費可刷低費率卡；大額或無卡通路可選銀行；現鈔費率通常最高，僅在必要時少量準備。",
    q4: "換匯成本太高怎麼降？", a4: "改用低費率數位卡或銀行、避開機場與旅館櫃台、注意海外刷卡手續費，並分批在好匯率時兌換。",
    q5: "匯率為何要乘 1000 輸入？", a5: "本工具以匯率欄位的千分位輸入便於精細調整；換算時自動換回實際匯率，結果以實收外幣為準。",
    q6: "這個工具能取代即時報價嗎？", a6: "不能。它只是快速估算與教育用途；正式金額應以銀行、發卡行或兌換所的即時報價為準。",
  },
  en: {
    badge: "Travel · Currency · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Currency Converter", subtitle: "Compute received foreign amount and conversion cost share from rate, home amount, and conversion channel",
    intro: "This calculator uses the exchange rate, home-currency amount, and conversion channel (bank, card, or cash) to compute the received foreign amount after fees and the conversion cost share, helping you judge which channel is the best deal and avoid losing trip money to high fees or poor rates.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a nominal rate times amount minus a channel fee rate, excluding live rate movement and issuer surcharges; rely on bank or card statements for the formal amount.",
    quickActionCard: "Quick Action Card", tryExample: "Create a conversion example instantly", examplePreview: "Conversion preview", examplePerson: "Rate (×1000)", fillExample: "One-click standard conversion example", previewActivePath: "Fill cash channel example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter rate, home amount, and conversion channel", examplesHelper: "Start with an example to see how rate and channel set the received foreign amount and cost share, then replace with your own conversion data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard card mode", activeExample: "Cash demo", baselineExampleNote: "Rate 32 · amount 30000 · card", activeExampleNote: "Rate 32 · amount 30000 · cash", carbsLabel: "Received foreign", carbsName: "foreign", proteinLabel: "Cost share", flowDemo: "Home amount", calculator: "Calculator",
    weight: "Rate (×1000)", tdee: "Home amount (currency)", goal: "Conversion channel", goalCut: "Bank (0.5%)", goalMaintain: "Card (2.5%)", goalBulk: "Cash (6%)",
    resultCard: "Conversion Result", unit: "foreign (received amount)", primaryValue: "Primary Value", maintenanceTarget: "Cost share", actionTarget: "Received foreign", estimatedTdee: "Home amount", maintenance: "%", fatLossTarget: "foreign",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card conversion-cost interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current conversion cost share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the conversion result into an actionable exchange strategy", conversionNote: "L9 values update from the computed result: cost share, received foreign, and home-amount hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current conversion snapshot", dailyGap: "Cost share", weeklyTrend: "Received foreign", motivation: "Motivation Card", keepMomentum: "Move from conversion analysis to the most economical channel",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's conversion result to your group", journeyHint: "Review it with the Travel Budget Calculator to spend the saved conversion cost on experiences.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold received foreign into total spend with Travel Budget", nextActionItem2: "Estimate daily foreign allowance with Daily Budget", nextActionItem3: "Confirm cross-currency options are equivalent with the Price Comparator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Home Amount → Cost Share → Channel → Budget", bmrStep: "Home amount", deficitStep: "Cost share", trendStep: "Channel", mealStep: "Budget",
    knowledge: "Knowledge", knowledgeTitle: "What currency conversion means in trip planning", definition: "Definition", definitionText: "Travel currency conversion turns a home-currency amount into foreign currency at the rate, then deducts channel fees to get the received amount; the conversion cost share measures how much fees and spread erode trip money, the core indicator for choosing a channel.", formula: "Formula", formulaText: "Received foreign = home amount × rate × (1 − channel fee rate). Cost share = channel fee rate × 100% (loss versus the nominal rate).", limitations: "Limitations", limitationsText: "This tool estimates from a nominal rate and a fixed channel fee rate; real conversion is also affected by live rate movement, issuer surcharges, ATM fees, and buy/sell spread, while channel rates change.", interpretation: "Interpretation", interpretationText: "A lower cost share is the better deal; banks and digital cards are usually below cash. Compare channels, avoid airport and hotel counters, and watch overseas card fees.", context: "Context", contextText: "Conversion results should be evaluated with travel budget, daily spend, and price comparison to balance rate, fees, and convenience.", example: "Example", exampleText: "Rate 32, card (2.5%), home amount 30000 → received foreign about 936, conversion cost share 2.5%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for conversion", premiumTitle: "PRO Currency Conversion Analytics Pack", premiumText: "Unlock live-rate feeds, multi-channel fee comparison, issuer-surcharge estimation, and buy/sell spread reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace bank quotes, issuer terms, or professional financial advice.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Daily Budget · Price Comparator · PPP", references: "References", referencesText: "Central-bank reference rates; card-network overseas rates; digital-bank conversion rates; travel conversion studies.",
    q1: "How is the received foreign amount calculated?", a1: "This tool estimates it as home amount times rate minus the channel fee rate; the actual amount is also affected by live rate movement and issuer surcharges.",
    q2: "What cost share is reasonable?", a2: "It depends on the channel; 2–3.5% is usually acceptable; above 7% means conversion cost is excessive, so switch to a bank or digital card.",
    q3: "Card, cash, or bank?", a3: "Small spending can use a low-fee card; large amounts or no-card channels can use a bank; cash rates are usually highest, so prepare only a small amount when necessary.",
    q4: "How do I lower high conversion cost?", a4: "Switch to a low-fee digital card or bank, avoid airport and hotel counters, watch overseas card fees, and convert in batches when the rate is good.",
    q5: "Why enter the rate as ×1000?", a5: "This tool uses a thousandths input in the rate field for fine adjustment; it converts back to the real rate automatically, with the result shown as received foreign.",
    q6: "Can this tool replace a live quote?", a6: "No. It is a quick estimate for education; the formal amount should rely on live quotes from banks, issuers, or exchange counters.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function channelFee(mode: TierMode): number {
  if (mode === "bank") return 0.005;
  if (mode === "cash") return 0.06;
  return 0.025;
}

export default function CurrencyTravelConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("32");
  const [tdee, setTdee] = useState("30000");
  const [goal, setGoal] = useState<TierMode>("card");
  const t = ui[lang];

  const result = useMemo(() => {
    const rate = Number(weight) / 1000;
    const homeAmount = Number(tdee);
    if (rate <= 0 || homeAmount <= 0) return null;
    const fee = channelFee(goal);
    const receivedForeign = homeAmount * rate * (1 - fee);
    const sharePct = fee * 100;
    return { rate, homeAmount, receivedForeign, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.receivedForeign, 0) : "—";
  const carbDisplay = result ? fmt(result.receivedForeign, 0) : "—";
  const totalDisplay = result ? fmt(result.receivedForeign, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("32"); setTdee("30000"); setGoal("card"); }
  function fillCut() { setUnit("metric"); setWeight("32"); setTdee("30000"); setGoal("cash"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "bank" ? "🟢" : goal === "cash" ? "💵" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">936</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">902</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="bank">{t.goalCut}</option><option value="card">{t.goalMaintain}</option><option value="cash">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="currency-travel-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.receivedForeign, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "HomeAmount", note: t.bmrStep }, { label: "CostShare", note: t.deficitStep }, { label: "Channel", note: t.trendStep }, { label: "Budget", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="currency-travel-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["LiveRateFeed", "ChannelCompare", "IssuerSurcharge", "SpreadReport"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
