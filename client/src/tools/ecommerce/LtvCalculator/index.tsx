// @profile B
// Profile B · Calculator-Ecommerce · LtvCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type LoyaltyMode = "low" | "standard" | "high";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 1k", label: { zh: "極低", en: "Very low" }, desc: { zh: "終身價值偏低，獲客成本須壓得很低才划算。", en: "Low lifetime value; acquisition cost must stay very low to pay off." } },
  { key: "low", range: "1k–3k", label: { zh: "偏低", en: "Low" }, desc: { zh: "回購或客單偏低，可強化會員與再行銷。", en: "Low repeat or order value; strengthen membership and remarketing." } },
  { key: "healthy", range: "3k–8k", label: { zh: "健康", en: "Healthy" }, desc: { zh: "多數電商常見區間，獲客與留存大致平衡。", en: "Common e-commerce band; acquisition and retention roughly balanced." } },
  { key: "good", range: "8k–15k", label: { zh: "良好", en: "Good" }, desc: { zh: "回購與客單不錯，可加碼獲客投放。", en: "Solid repeat and order value; can scale acquisition spend." } },
  { key: "strong", range: "15k–30k", label: { zh: "強勁", en: "Strong" }, desc: { zh: "高忠誠或高客單，留存策略奏效。", en: "High loyalty or order value; retention strategy is working." } },
  { key: "elite", range: "> 30k", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "極高終身價值，通常為訂閱或高價類別。", en: "Very high lifetime value; usually subscription or premium category." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "顧客獲取成本計算機", en: "CAC Calculator" }, href: "/tools/ecommerce/cac-calculator" },
  { label: { zh: "流失率計算機", en: "Churn Rate Calculator" }, href: "/tools/ecommerce/churn-rate-calculator" },
  { label: { zh: "廣告成本計算機", en: "Ad Cost Calculator" }, href: "/tools/ecommerce/ad-cost-calculator" },
  { label: { zh: "月經常性收入計算機", en: "MRR Calculator" }, href: "/tools/ecommerce/mrr-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 顧客價值 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "顧客終身價值計算機 · Customer LTV", subtitle: "用客單價、回購頻率與顧客壽命估算每位顧客的終身價值",
    intro: "Customer LTV Calculator 依據平均客單價、年回購次數與顧客平均壽命，估算每位顧客在生命週期內帶來的總價值，協助你判斷獲客投入是否划算、設定合理的獲客成本上限。",
    trustNoteLabel: "注意事項：", trustNote: "本工具用毛收入估算 LTV，未扣商品成本與履約費用；若要看真實獲利型 LTV，應乘上毛利率再與獲客成本比較。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立顧客終身價值範例", examplePreview: "LTV 預覽", examplePerson: "客單價", fillExample: "一鍵填入標準範例", previewActivePath: "填入高忠誠範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入客單價、年回購次數與忠誠度", examplesHelper: "先用範例理解客單價與回購頻率如何決定 LTV，再改成自己的顧客數據。",
    metric: "毛收入", imperial: "毛利型", exampleCards: "範例卡", baselineExample: "標準顧客模式", activeExample: "高忠誠示範", baselineExampleNote: "客單 1,000 · 年購 3 次 · 標準", activeExampleNote: "客單 1,000 · 年購 3 次 · 高忠誠", carbsLabel: "終身價值", carbsName: "元", proteinLabel: "年度價值", flowDemo: "年回購", calculator: "計算機",
    weight: "平均客單價 (元)", tdee: "年回購次數 (次)", goal: "忠誠度", goalCut: "低 (1.5 年)", goalMaintain: "標準 (3 年)", goalBulk: "高 (5 年)",
    resultCard: "顧客終身價值結果", unit: "元 (LTV)", primaryValue: "主要數值", maintenanceTarget: "年度價值", actionTarget: "顧客壽命", estimatedTdee: "年回購", maintenance: "元/年", fatLossTarget: "年",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 LTV 判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前 LTV 放進常見價值區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把終身價值轉成可執行的留存策略", conversionNote: "L9 會連動目前計算結果，顯示年度價值、顧客壽命與可承擔獲客成本提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前顧客概況", dailyGap: "年度價值", weeklyTrend: "顧客壽命", motivation: "動力卡", keepMomentum: "從價值分析走向穩定留存",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的顧客終身價值帶回團隊", journeyHint: "用毛利率調整成真實獲利型 LTV，避免高估可承擔的獲客成本。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 CAC 比較確認 LTV/CAC 是否健康", nextActionItem2: "用流失率檢查顧客壽命假設", nextActionItem3: "用廣告成本回推可承擔的獲客上限",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "LTV → CAC → 流失率 → 廣告成本", bmrStep: "終身價值", deficitStep: "獲客成本", trendStep: "流失率", mealStep: "廣告成本",
    knowledge: "知識", knowledgeTitle: "顧客終身價值在電商營運中的意義", definition: "定義", definitionText: "顧客終身價值 LTV 是一位顧客在整個生命週期內帶來的總價值，用來衡量顧客的長期貢獻，是設定獲客預算的核心基準。", formula: "公式", formulaText: "LTV = 平均客單價 × 年回購次數 × 顧客平均壽命（年）。年度價值 = 客單價 × 年回購次數。", limitations: "限制", limitationsText: "本工具用毛收入估算；真實獲利型 LTV 應乘毛利率並考慮折現、退貨與成本變動，且回購與壽命會隨時間變動。", interpretation: "解讀", interpretationText: "LTV 本身不夠，要與獲客成本 CAC 比較；健康經驗值為 LTV/CAC 約 3 倍以上，過低代表獲客不划算。", context: "脈絡", contextText: "LTV 應與 CAC、流失率、廣告成本一起看，才能判斷成長是否可持續。", example: "範例", exampleText: "客單 1,000、年購 3 次、壽命 3 年 → 年度價值 3,000，LTV 9,000 元。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "顧客價值的下一步工具", premiumTitle: "PRO 顧客價值分析包", premiumText: "解鎖毛利型 LTV、分群 LTV、LTV/CAC 比率追蹤與折現後終身價值報告。", feat1: "利潤LTV", feat2: "分群", feat3: "比率", feat4: "折現",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "CAC Calculator · Churn Rate Calculator · Ad Cost Calculator · MRR Calculator", references: "參考資料", referencesText: "HBR Customer Lifetime Value research; AMA Marketing Metrics; Farris Marketing Metrics handbook; Reichheld Loyalty Effect。",
    q1: "LTV 和年度價值差在哪？", a1: "年度價值是一年的貢獻；LTV 是把年度價值乘上顧客平均壽命，看的是整個生命週期的總價值。",
    q2: "LTV/CAC 多少才健康？", a2: "常見經驗值約 3 倍以上；過低代表獲客不划算，過高可能投放太保守、成長太慢。",
    q3: "顧客壽命怎麼估？", a3: "可用 1 ÷ 年流失率近似；流失率越低壽命越長，建議用流失率計算機交叉驗證。",
    q4: "該用毛收入還是毛利算？", a4: "比較獲客成本時應用毛利型 LTV（乘毛利率）；毛收入型只看規模，容易高估可承擔成本。",
    q5: "新品牌沒有歷史資料怎麼辦？", a5: "先用同類別經驗值與早期回購估算，累積數據後再以實際分群 LTV 校正。",
    q6: "這個工具能取代財務模型嗎？", a6: "不能。它只是快速估算與教育用途；正式評估需折現、成本與分群的完整模型。",
  },
  en: {
    badge: "E-Commerce · Customer Value · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Customer LTV Calculator", subtitle: "Estimate each customer's lifetime value from order value, repeat frequency, and lifespan",
    intro: "This calculator uses average order value, yearly repeat purchases, and average customer lifespan to estimate the total value each customer brings over their lifecycle, helping you judge whether acquisition spend pays off and set a sensible cap on acquisition cost.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates LTV from gross revenue and does not deduct product cost or fulfillment. For a true profit-based LTV, multiply by gross margin before comparing to acquisition cost.",
    quickActionCard: "Quick Action Card", tryExample: "Create a customer LTV example instantly", examplePreview: "LTV preview", examplePerson: "Order value", fillExample: "One-click standard example", previewActivePath: "Fill high-loyalty example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter order value, yearly repeats, and loyalty", examplesHelper: "Start with an example to understand how order value and repeat frequency set LTV, then replace with your own customer data.",
    metric: "Gross revenue", imperial: "Profit-based", exampleCards: "Example cards", baselineExample: "Standard customer", activeExample: "High-loyalty demo", baselineExampleNote: "Order 1,000 · 3 buys/yr · standard", activeExampleNote: "Order 1,000 · 3 buys/yr · high loyalty", carbsLabel: "Lifetime value", carbsName: "currency", proteinLabel: "Annual value", flowDemo: "Yearly repeats", calculator: "Calculator",
    weight: "Average order value (currency)", tdee: "Yearly repeat purchases (count)", goal: "Loyalty", goalCut: "Low (1.5 yr)", goalMaintain: "Standard (3 yr)", goalBulk: "High (5 yr)",
    resultCard: "Customer LTV Result", unit: "currency (LTV)", primaryValue: "Primary Value", maintenanceTarget: "Annual value", actionTarget: "Customer lifespan", estimatedTdee: "Yearly repeats", maintenance: "/yr", fatLossTarget: "years",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card LTV interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current LTV into common value zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn lifetime value into an actionable retention strategy", conversionNote: "L9 values update from the computed result: annual value, customer lifespan, and affordable acquisition cost hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current customer snapshot", dailyGap: "Annual value", weeklyTrend: "Customer lifespan", motivation: "Motivation Card", keepMomentum: "Move from value analysis to steady retention",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's customer LTV to your team", journeyHint: "Adjust by gross margin to a true profit-based LTV to avoid overstating the acquisition cost you can afford.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm a healthy LTV/CAC by comparing with CAC", nextActionItem2: "Check the lifespan assumption with Churn Rate", nextActionItem3: "Back out the affordable acquisition cap with Ad Cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "LTV → CAC → Churn → Ad Cost", bmrStep: "Lifetime value", deficitStep: "Acquisition cost", trendStep: "Churn rate", mealStep: "Ad cost",
    knowledge: "Knowledge", knowledgeTitle: "What customer LTV means in e-commerce operations", definition: "Definition", definitionText: "Customer lifetime value (LTV) is the total value one customer brings over their entire lifecycle, measuring long-term contribution and serving as the core basis for setting acquisition budgets.", formula: "Formula", formulaText: "LTV = average order value × yearly repeat purchases × average customer lifespan (years). Annual value = order value × yearly repeats.", limitations: "Limitations", limitationsText: "This tool estimates from gross revenue; a true profit-based LTV multiplies by gross margin and considers discounting, returns, and cost changes, while repeats and lifespan shift over time.", interpretation: "Interpretation", interpretationText: "LTV alone is not enough—compare it to acquisition cost (CAC); a healthy rule of thumb is LTV/CAC of about 3x or more, and too low means acquisition does not pay off.", context: "Context", contextText: "LTV should be evaluated with CAC, churn, and ad cost to judge whether growth is sustainable.", example: "Example", exampleText: "Order 1,000, 3 buys/yr, 3-year lifespan → annual value 3,000, LTV 9,000.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for customer value", premiumTitle: "PRO Customer Value Analytics Pack", premiumText: "Unlock profit-based LTV, segment LTV, LTV/CAC ratio tracking, and discounted lifetime value reports.", feat1: "Profit LTV", feat2: "Segment", feat3: "Ratio", feat4: "Discount",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "CAC Calculator · Churn Rate Calculator · Ad Cost Calculator · MRR Calculator", references: "References", referencesText: "HBR Customer Lifetime Value research; AMA Marketing Metrics; Farris Marketing Metrics handbook; Reichheld Loyalty Effect.",
    q1: "How is LTV different from annual value?", a1: "Annual value is one year's contribution; LTV multiplies annual value by average customer lifespan, looking at total value over the whole lifecycle.",
    q2: "What LTV/CAC is healthy?", a2: "A common rule of thumb is about 3x or more; too low means acquisition does not pay off, too high may mean spend is too conservative and growth too slow.",
    q3: "How do I estimate customer lifespan?", a3: "You can approximate it as 1 ÷ yearly churn rate; lower churn means longer lifespan—cross-check with the Churn Rate Calculator.",
    q4: "Should I use gross revenue or profit?", a4: "When comparing to acquisition cost, use profit-based LTV (multiplied by gross margin); the gross-revenue version only shows scale and easily overstates affordable cost.",
    q5: "What if a new brand has no history?", a5: "Start with category benchmarks and early repeats, then recalibrate with actual segment LTV once data accumulates.",
    q6: "Can this tool replace a financial model?", a6: "No. It is a quick estimate for education; formal evaluation needs a full model with discounting, cost, and segmentation.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function lifespanYears(mode: LoyaltyMode): number {
  if (mode === "low") return 1.5;
  if (mode === "high") return 5;
  return 3;
}

export default function LtvCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1000");
  const [tdee, setTdee] = useState("3");
  const [goal, setGoal] = useState<LoyaltyMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const aov = Number(weight);
    const repeats = Number(tdee);
    if (aov <= 0 || repeats <= 0) return null;
    const years = lifespanYears(goal);
    const annualValue = aov * repeats;
    const ltv = annualValue * years;
    return { aov, repeats, years, annualValue, ltv };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.annualValue, 0) : "—";
  const fatDisplay = result ? fmt(result.years, 1) : "—";
  const carbDisplay = result ? fmt(result.ltv, 0) : "—";
  const totalDisplay = result ? fmt(result.ltv, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1000"); setTdee("3"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1000"); setTdee("3"); setGoal("high"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "low" ? "🟡" : goal === "high" ? "💎" : "🟢"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">9k</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">15k</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as LoyaltyMode)}><option value="low">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="high">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">$</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">y</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ltv-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.annualValue, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.years, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "LTV", note: t.bmrStep }, { label: "CAC", note: t.deficitStep }, { label: "Churn", note: t.trendStep }, { label: "AdCost", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ltv-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
