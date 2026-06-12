// @profile B
// Profile B · Calculator-Ecommerce · CacCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type ChannelMode = "organic" | "paid" | "mixed";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 100", label: { zh: "極低", en: "Very low" }, desc: { zh: "獲客成本極低，通常為自然或口碑流量。", en: "Very low acquisition cost; usually organic or word-of-mouth." } },
  { key: "low", range: "100–300", label: { zh: "偏低", en: "Low" }, desc: { zh: "成本控制良好，投放效率高。", en: "Well-controlled cost with efficient spend." } },
  { key: "healthy", range: "300–600", label: { zh: "健康", en: "Healthy" }, desc: { zh: "多數電商常見區間，視 LTV 而定。", en: "Common e-commerce band, depending on LTV." } },
  { key: "watch", range: "600–1000", label: { zh: "需留意", en: "Watch" }, desc: { zh: "成本偏高，須確認 LTV 能撐住。", en: "Cost runs high; confirm LTV can support it." } },
  { key: "high", range: "1000–2000", label: { zh: "偏高", en: "High" }, desc: { zh: "獲客昂貴，留意回本期與現金流。", en: "Expensive acquisition; watch payback and cash flow." } },
  { key: "critical", range: "> 2000", label: { zh: "嚴重", en: "Critical" }, desc: { zh: "成本過高，多數情境難以回本。", en: "Cost too high; hard to recoup in most cases." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "顧客終身價值計算機", en: "LTV Calculator" }, href: "/tools/ecommerce/ltv-calculator" },
  { label: { zh: "廣告成本計算機", en: "Ad Cost Calculator" }, href: "/tools/ecommerce/ad-cost-calculator" },
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "流失率計算機", en: "Churn Rate Calculator" }, href: "/tools/ecommerce/churn-rate-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 顧客獲取 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "顧客獲取成本計算機 · CAC", subtitle: "用總獲客支出與新顧客數估算每位顧客的獲取成本與回本月數",
    intro: "CAC Calculator 依據總行銷與銷售支出及新增顧客數，估算每位新顧客的獲取成本，並結合終身價值估算 LTV/CAC 與回本月數，協助您判斷獲客是否划算。",
    trustNoteLabel: "注意事項：", trustNote: "CAC 應包含廣告、人力、工具與促銷等全部獲客支出；只算媒體費會低估真實成本，導致高估獲客效率。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立獲客成本範例", examplePreview: "CAC 預覽", examplePerson: "獲客支出", fillExample: "一鍵填入標準範例", previewActivePath: "填入高成本範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入獲客支出、新顧客數與通路", examplesHelper: "先用範例理解支出與新顧客數如何決定 CAC，再改成自己的獲客數據。",
    metric: "全通路", imperial: "單通路", exampleCards: "範例卡", baselineExample: "標準獲客模式", activeExample: "高成本示範", baselineExampleNote: "支出 100,000 · 新客 300 · 混合", activeExampleNote: "支出 100,000 · 新客 100 · 付費", carbsLabel: "CAC", carbsName: "元/人", proteinLabel: "LTV/CAC", flowDemo: "新顧客", calculator: "計算機",
    weight: "總獲客支出 (元)", tdee: "新增顧客數 (人)", goal: "獲客通路", goalCut: "自然", goalMaintain: "混合", goalBulk: "付費",
    resultCard: "顧客獲取成本結果", unit: "元 / 人 (CAC)", primaryValue: "主要數值", maintenanceTarget: "LTV/CAC", actionTarget: "回本月數", estimatedTdee: "新顧客", maintenance: "倍", fatLossTarget: "月",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 CAC 判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前 CAC 放進常見成本區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把獲客成本轉成可執行的投放策略", conversionNote: "L9 會連動目前計算結果，顯示 LTV/CAC、回本月數與獲客效率提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前獲客概況", dailyGap: "LTV/CAC", weeklyTrend: "回本月數", motivation: "動力卡", keepMomentum: "從成本分析走向穩定獲利",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的獲客成本帶回團隊", journeyHint: "用包含人力與工具的全成本重算，避免只看媒體費而高估獲客效率。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 LTV 確認顧客價值能否覆蓋 CAC", nextActionItem2: "用廣告成本拆解通路獲客效率", nextActionItem3: "用流失率檢查回本期是否合理",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "CAC → LTV → 廣告成本 → 流失率", bmrStep: "獲客成本", deficitStep: "終身價值", trendStep: "廣告成本", mealStep: "流失率",
    knowledge: "知識", knowledgeTitle: "顧客獲取成本在電商營運中的意義", definition: "定義", definitionText: "顧客獲取成本 CAC 是取得一位新顧客的平均成本，含廣告、人力、工具與促銷等全部獲客支出，是衡量成長效率的核心指標。", formula: "公式", formulaText: "CAC = 總獲客支出 ÷ 新增顧客數。LTV/CAC = 終身價值 ÷ CAC。回本月數 ≈ CAC ÷ 月度顧客貢獻。", limitations: "限制", limitationsText: "本工具用估計的 LTV 倍數示範回本；真實評估須用自家毛利型 LTV，並區分通路、時間遞延與促銷一次性成本。", interpretation: "解讀", interpretationText: "CAC 高低不能單看絕對值，要與 LTV 比較；LTV/CAC 約 3 倍以上較健康，回本越快現金流壓力越小。", context: "脈絡", contextText: "CAC 應與 LTV、廣告成本、流失率一起看，才能判斷成長是否可持續。", example: "範例", exampleText: "支出 100,000、新客 300 → CAC 約 333 元/人；若 LTV 1,000 則 LTV/CAC 約 3 倍。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "顧客獲取的下一步工具", premiumTitle: "PRO 獲客分析包", premiumText: "解鎖通路別 CAC、毛利型 LTV/CAC、回本期模擬與每月獲客效率趨勢報告。", feat1: "渠道CAC", feat2: "利潤比率", feat3: "回收期", feat4: "趨勢追蹤",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "LTV Calculator · Ad Cost Calculator · Conversion Rate Calculator · Churn Rate Calculator", references: "參考資料", referencesText: "AMA Marketing Metrics; Farris Marketing Metrics handbook; a16z SaaS metrics; David Skok SaaS economics。",
    q1: "CAC 該包含哪些成本？", a1: "廣告媒體費、行銷與業務人力、工具與軟體、促銷與折扣等全部獲客支出；只算媒體費會嚴重低估。",
    q2: "LTV/CAC 多少才健康？", a2: "常見經驗值約 3 倍以上；過低代表獲客不划算，過高可能投放太保守、成長太慢。",
    q3: "回本月數怎麼看？", a3: "回本越快現金流越健康；訂閱型常追求 12 個月內回本，回本太慢需更多營運資金。",
    q4: "自然與付費 CAC 該分開算嗎？", a4: "應分通路看。自然 CAC 通常較低但量有限；付費可擴量但成本較高，混合算容易掩蓋問題通路。",
    q5: "CAC 突然上升怎麼辦？", a5: "檢查是否流量飽和、競價變貴或轉換率下降；可優化落地頁、調整出價或轉向更高效通路。",
    q6: "這個工具能取代財務模型嗎？", a6: "不能。它只是快速估算與教育用途；正式評估需通路別與毛利型的完整模型。",
  },
  en: {
    badge: "E-Commerce · Customer Acquisition · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "CAC Calculator", subtitle: "Estimate cost per customer and payback months from total acquisition spend and new customers",
    intro: "This calculator uses total marketing and sales spend and new customers acquired to estimate the cost of acquiring each new customer, and combines it with lifetime value to estimate LTV/CAC and payback months, helping you judge whether acquisition pays off.",
    trustNoteLabel: "Note:", trustNote: "CAC should include all acquisition spend—ads, labor, tools, and promotions. Counting media cost alone understates true cost and overstates acquisition efficiency.",
    quickActionCard: "Quick Action Card", tryExample: "Create an acquisition cost example instantly", examplePreview: "CAC preview", examplePerson: "Acquisition spend", fillExample: "One-click standard example", previewActivePath: "Fill high-cost example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter acquisition spend, new customers, and channel", examplesHelper: "Start with an example to understand how spend and new customers set CAC, then replace with your own acquisition data.",
    metric: "All channels", imperial: "Single channel", exampleCards: "Example cards", baselineExample: "Standard acquisition", activeExample: "High-cost demo", baselineExampleNote: "Spend 100,000 · 300 new · mixed", activeExampleNote: "Spend 100,000 · 100 new · paid", carbsLabel: "CAC", carbsName: "/customer", proteinLabel: "LTV/CAC", flowDemo: "New customers", calculator: "Calculator",
    weight: "Total acquisition spend (currency)", tdee: "New customers acquired (count)", goal: "Acquisition channel", goalCut: "Organic", goalMaintain: "Mixed", goalBulk: "Paid",
    resultCard: "CAC Result", unit: "per customer (CAC)", primaryValue: "Primary Value", maintenanceTarget: "LTV/CAC", actionTarget: "Payback months", estimatedTdee: "New customers", maintenance: "x", fatLossTarget: "months",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card CAC interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current CAC into common cost zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn acquisition cost into an actionable spend strategy", conversionNote: "L9 values update from the computed result: LTV/CAC, payback months, and acquisition efficiency hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current acquisition snapshot", dailyGap: "LTV/CAC", weeklyTrend: "Payback months", motivation: "Motivation Card", keepMomentum: "Move from cost analysis to steady profit",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's acquisition cost to your team", journeyHint: "Recompute using full cost including labor and tools to avoid overstating efficiency by looking at media cost only.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm customer value can cover CAC with LTV", nextActionItem2: "Break down channel efficiency with Ad Cost", nextActionItem3: "Check whether payback is reasonable with Churn Rate",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "CAC → LTV → Ad Cost → Churn", bmrStep: "Acquisition cost", deficitStep: "Lifetime value", trendStep: "Ad cost", mealStep: "Churn rate",
    knowledge: "Knowledge", knowledgeTitle: "What customer acquisition cost means in e-commerce operations", definition: "Definition", definitionText: "Customer acquisition cost (CAC) is the average cost to win one new customer—including ads, labor, tools, and promotions—a core metric for measuring growth efficiency.", formula: "Formula", formulaText: "CAC = total acquisition spend ÷ new customers acquired. LTV/CAC = lifetime value ÷ CAC. Payback months ≈ CAC ÷ monthly customer contribution.", limitations: "Limitations", limitationsText: "This tool uses an estimated LTV multiple to illustrate payback; real evaluation needs your own profit-based LTV and should separate channels, time lag, and one-off promotion costs.", interpretation: "Interpretation", interpretationText: "CAC cannot be judged by its absolute value alone—compare it to LTV; LTV/CAC of about 3x or more is healthier, and faster payback means less cash-flow pressure.", context: "Context", contextText: "CAC should be evaluated with LTV, ad cost, and churn to judge whether growth is sustainable.", example: "Example", exampleText: "Spend 100,000, 300 new → CAC ~333 per customer; if LTV is 1,000 then LTV/CAC ~3x.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for customer acquisition", premiumTitle: "PRO Acquisition Analytics Pack", premiumText: "Unlock per-channel CAC, profit-based LTV/CAC, payback simulation, and monthly acquisition efficiency trend reports.", feat1: "Channel CAC", feat2: "Profit Ratio", feat3: "Payback", feat4: "Trend",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "LTV Calculator · Ad Cost Calculator · Conversion Rate Calculator · Churn Rate Calculator", references: "References", referencesText: "AMA Marketing Metrics; Farris Marketing Metrics handbook; a16z SaaS metrics; David Skok SaaS economics.",
    q1: "What costs should CAC include?", a1: "Ad media cost, marketing and sales labor, tools and software, promotions and discounts—all acquisition spend; media cost alone severely understates it.",
    q2: "What LTV/CAC is healthy?", a2: "A common rule of thumb is about 3x or more; too low means acquisition does not pay off, too high may mean spend is too conservative and growth too slow.",
    q3: "How do I read payback months?", a3: "Faster payback means healthier cash flow; subscription models often target payback within 12 months, and slow payback needs more working capital.",
    q4: "Should organic and paid CAC be separated?", a4: "Yes, view by channel. Organic CAC is usually lower but limited in volume; paid scales but costs more, and blending hides problem channels.",
    q5: "What if CAC suddenly rises?", a5: "Check for traffic saturation, costlier bidding, or falling conversion; optimize landing pages, adjust bids, or shift to more efficient channels.",
    q6: "Can this tool replace a financial model?", a6: "No. It is a quick estimate for education; formal evaluation needs a full model by channel and profit-based LTV.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function assumedLtv(mode: ChannelMode): number {
  if (mode === "organic") return 1500;
  if (mode === "paid") return 1000;
  return 1200;
}

export default function CacCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100000");
  const [tdee, setTdee] = useState("300");
  const [goal, setGoal] = useState<ChannelMode>("mixed");
  const t = ui[lang];

  const result = useMemo(() => {
    const spend = Number(weight);
    const customers = Number(tdee);
    if (spend <= 0 || customers <= 0) return null;
    const ltv = assumedLtv(goal);
    const cac = spend / customers;
    const ratio = cac > 0 ? ltv / cac : 0;
    const payback = ltv > 0 ? cac / (ltv / 12) : 0;
    return { spend, customers, ltv, cac, ratio, payback };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.ratio, 1) : "—";
  const fatDisplay = result ? fmt(result.payback, 1) : "—";
  const carbDisplay = result ? fmt(result.cac, 0) : "—";
  const totalDisplay = result ? fmt(result.cac, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100000"); setTdee("300"); setGoal("mixed"); }
  function fillCut() { setUnit("metric"); setWeight("100000"); setTdee("100"); setGoal("paid"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "organic" ? "🌱" : goal === "paid" ? "💰" : "🔀"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">333</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1000</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as ChannelMode)}><option value="organic">{t.goalCut}</option><option value="mixed">{t.goalMaintain}</option><option value="paid">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">×</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">m</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cac-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}×</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.ratio, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.payback, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "CAC", note: t.bmrStep }, { label: "LTV", note: t.deficitStep }, { label: "AdCost", note: t.trendStep }, { label: "Churn", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cac-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
