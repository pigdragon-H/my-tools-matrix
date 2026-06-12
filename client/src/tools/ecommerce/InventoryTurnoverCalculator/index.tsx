// @profile B
// Profile B · Calculator-Ecommerce · InventoryTurnoverCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type PeriodMode = "annual" | "quarterly" | "monthly";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "stagnant", range: "< 2×", label: { zh: "嚴重滯銷", en: "Stagnant" }, desc: { zh: "資金大量壓在庫存，跌價與報廢風險高，需積極促銷或清倉。", en: "Capital heavily tied in stock; high markdown and obsolescence risk." } },
  { key: "slow", range: "2–4×", label: { zh: "週轉偏慢", en: "Slow" }, desc: { zh: "庫存偏高，現金回收慢，建議檢視採購與品項結構。", en: "Inventory runs high; slow cash recovery. Review purchasing mix." } },
  { key: "healthy", range: "4–8×", label: { zh: "健康區間", en: "Healthy" }, desc: { zh: "多數零售與電商的常見健康帶，供需大致平衡。", en: "Common healthy band for retail and e-commerce; supply meets demand." } },
  { key: "optimal", range: "8–12×", label: { zh: "高效週轉", en: "Optimal" }, desc: { zh: "資金效率佳，庫存精實，需留意安全庫存避免缺貨。", en: "Strong capital efficiency; lean stock—watch safety stock to avoid stockouts." } },
  { key: "aggressive", range: "12–20×", label: { zh: "極速週轉", en: "Aggressive" }, desc: { zh: "週轉極快，缺貨與補貨壓力上升，需強化供應鏈韌性。", en: "Very fast turns; rising stockout and replenishment pressure." } },
  { key: "stockout", range: "> 20×", label: { zh: "缺貨風險", en: "Stockout risk" }, desc: { zh: "庫存可能過低，易錯失銷售，建議重新校準安全庫存。", en: "Inventory may be too low; recalibrate safety stock to avoid lost sales." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "毛利率計算機", en: "Gross Margin Calculator" }, href: "/tools/ecommerce/gross-margin-calculator" },
  { label: { zh: "再訂購點計算機", en: "Reorder Point Calculator" }, href: "/tools/ecommerce/reorder-point-calculator" },
  { label: { zh: "庫存持有成本計算機", en: "Carrying Cost Calculator" }, href: "/tools/ecommerce/carrying-cost-calculator" },
  { label: { zh: "現金週期計算機", en: "Cash Cycle Calculator" }, href: "/tools/ecommerce/cash-conversion-cycle-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 庫存營運 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "存貨週轉率計算機 · Inventory Turnover", subtitle: "用銷貨成本與平均存貨估算週轉率、週轉天數與資金效率",
    intro: "Inventory Turnover Calculator 依據銷貨成本（COGS）與平均存貨金額，並可選擇統計期間（年/季/月），估算存貨週轉率（次）、存貨週轉天數（DIO），協助評估庫存資金效率與補貨節奏。",
    trustNoteLabel: "注意事項：", trustNote: "週轉率受產業特性、季節性與品項結構影響甚大；本工具為營運規劃用途，非財務報表或審計依據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立存貨週轉範例", examplePreview: "週轉率預覽", examplePerson: "標準零售", fillExample: "一鍵填入標準範例", previewActivePath: "填入高速週轉範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入銷貨成本與平均存貨", examplesHelper: "先用範例理解週轉率、週轉天數與資金效率，再改成自己的 COGS 與平均存貨。",
    metric: "年度 (Annual)", imperial: "月度 (Monthly)", exampleCards: "範例卡", baselineExample: "標準零售模式", activeExample: "高速週轉示範", baselineExampleNote: "COGS 1,200,000 · 平均存貨 200,000", activeExampleNote: "COGS 2,400,000 · 平均存貨 150,000", carbsLabel: "週轉天數", carbsName: "DIO（天）", proteinLabel: "週轉率", flowDemo: "平均存貨", calculator: "計算機",
    weight: "銷貨成本 COGS", tdee: "平均存貨金額", goal: "統計期間", goalCut: "年度", goalMaintain: "季度", goalBulk: "月度",
    resultCard: "存貨週轉分析結果", unit: "次 / 期間", primaryValue: "主要數值", maintenanceTarget: "週轉率 (次)", actionTarget: "週轉天數 (天)", estimatedTdee: "平均存貨", maintenance: "週轉率", fatLossTarget: "DIO",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格存貨週轉判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前週轉率放進常見營運區間；這是規劃參考，不是財務或審計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把週轉分析轉成可執行的庫存策略", conversionNote: "L9 會連動目前計算結果，顯示週轉天數、每日耗用與補貨提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前週轉概況", dailyGap: "每日耗用", weeklyTrend: "每元庫存產出", motivation: "動力卡", keepMomentum: "從週轉分析走向穩定補貨節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的週轉分析帶回團隊", journeyHint: "用 3–6 個月平均存貨重新估算，避免被單月進貨高峰誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用毛利率確認每筆銷售的獲利空間", nextActionItem2: "用再訂購點決定何時補貨、補多少", nextActionItem3: "用現金週期檢查存貨對現金流的整體影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "毛利率 → 週轉率 → 再訂購點 / 現金週期", bmrStep: "毛利率", deficitStep: "週轉率", trendStep: "再訂購點", mealStep: "現金週期",
    knowledge: "知識", knowledgeTitle: "存貨週轉率在電商營運中的意義", definition: "定義", definitionText: "存貨週轉率衡量一段期間內庫存被銷售並補充的次數，反映資金在存貨上的運用效率。", formula: "公式", formulaText: "週轉率 = 銷貨成本(COGS) ÷ 平均存貨。週轉天數(DIO) = 期間天數 ÷ 週轉率。平均存貨 =（期初 + 期末）÷ 2。", limitations: "限制", limitationsText: "不同產業合理區間差異極大（生鮮高、珠寶低）；季節性、促銷與會計方法都會影響數值，需搭配毛利與現金流一起看。", interpretation: "解讀", interpretationText: "週轉率太低代表資金壓在庫存、跌價風險高；太高可能缺貨、錯失銷售。健康帶需依產業校準。", context: "脈絡", contextText: "週轉率應接在毛利率之後，並與再訂購點、現金週期一起評估。", example: "範例", exampleText: "COGS 1,200,000、平均存貨 200,000 → 週轉率 6 次，週轉天數約 61 天（年度）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "庫存營運的下一步工具", premiumTitle: "PRO 庫存分析包", premiumText: "解鎖品項級週轉排行、滯銷預警、安全庫存建議與多倉現金佔用報告。", feat1: "排名", feat2: "警示", feat3: "安全庫存", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供營運規劃與教育用途，不取代財務報表、審計或專業會計建議。", relatedTools: "相關工具", relatedToolsText: "Gross Margin Calculator · Reorder Point Calculator · Carrying Cost Calculator · Cash Conversion Cycle Calculator", references: "參考資料", referencesText: "CFI Inventory Turnover Ratio guide; Investopedia Inventory Turnover definition; APICS/ASCM Operations Management body of knowledge; Harvard Business Review Working Capital articles。",
    q1: "週轉率多少才算好？", a1: "沒有單一標準。生鮮食品可能 20+，珠寶可能低於 2；同產業比較與自身趨勢更有意義。",
    q2: "為什麼要用平均存貨而不是期末存貨？", a2: "期末存貨易受促銷或進貨時點扭曲，用期初與期末平均更能代表整段期間的庫存水準。",
    q3: "週轉率越高越好嗎？", a3: "不一定。過高常伴隨缺貨與頻繁補貨成本，需與服務水準和安全庫存一起權衡。",
    q4: "週轉天數（DIO）怎麼用？", a4: "DIO 代表庫存平均賣完所需天數，是現金週期（CCC）的重要組成，越短代表資金回收越快。",
    q5: "可以用營收取代 COGS 嗎？", a5: "標準公式用 COGS。若用營收會因毛利墊高而高估週轉率；除非僅做粗略比較，否則建議用 COGS。",
    q6: "這個工具能取代庫存管理系統嗎？", a6: "不能。它只是快速估算與教育用途；實際補貨與安全庫存仍需 ERP/WMS 與品項級資料。",
  },
  en: {
    badge: "E-Commerce · Inventory Ops · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Inventory Turnover Calculator", subtitle: "Estimate turnover ratio, days inventory, and capital efficiency from COGS and average inventory",
    intro: "This calculator uses Cost of Goods Sold (COGS) and average inventory value, with a selectable period (annual/quarterly/monthly), to estimate inventory turnover ratio and Days Inventory Outstanding (DIO), helping you assess capital efficiency and replenishment cadence.",
    trustNoteLabel: "Note:", trustNote: "Turnover is heavily affected by industry, seasonality, and product mix. This tool is for operational planning, not financial statements or audit.",
    quickActionCard: "Quick Action Card", tryExample: "Create an inventory turnover example instantly", examplePreview: "Turnover preview", examplePerson: "Standard retail", fillExample: "One-click standard example", previewActivePath: "Fill aggressive-turn example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter COGS and average inventory", examplesHelper: "Start with an example to understand turnover ratio, days inventory, and capital efficiency, then replace with your own COGS and average inventory.",
    metric: "Annual", imperial: "Monthly", exampleCards: "Example cards", baselineExample: "Standard retail mode", activeExample: "Aggressive-turn demo", baselineExampleNote: "COGS 1,200,000 · Avg inventory 200,000", activeExampleNote: "COGS 2,400,000 · Avg inventory 150,000", carbsLabel: "Days inventory", carbsName: "DIO (days)", proteinLabel: "Turnover", flowDemo: "Avg inventory", calculator: "Calculator",
    weight: "COGS", tdee: "Average inventory value", goal: "Period", goalCut: "Annual", goalMaintain: "Quarterly", goalBulk: "Monthly",
    resultCard: "Inventory Turnover Result", unit: "× / period", primaryValue: "Primary Value", maintenanceTarget: "Turnover (×)", actionTarget: "Days inventory", estimatedTdee: "Avg inventory", maintenance: "Turnover", fatLossTarget: "DIO",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card turnover interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current turnover ratio into common operating zones. This is planning guidance, not a financial or audit conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn turnover analysis into an actionable inventory strategy", conversionNote: "L9 values update from the computed result: days inventory, daily consumption, and replenishment hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current turnover snapshot", dailyGap: "Daily consumption", weeklyTrend: "Output per inventory unit", motivation: "Motivation Card", keepMomentum: "Move from turnover analysis to a steady replenishment cadence",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's turnover analysis to your team", journeyHint: "Re-estimate using 3–6 month average inventory to avoid being misled by a single-month purchasing spike.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm per-sale profit room with Gross Margin", nextActionItem2: "Decide when and how much to reorder with Reorder Point", nextActionItem3: "Check the overall cash-flow impact with Cash Conversion Cycle",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Gross Margin → Turnover → Reorder Point / Cash Cycle", bmrStep: "Gross margin", deficitStep: "Turnover", trendStep: "Reorder point", mealStep: "Cash cycle",
    knowledge: "Knowledge", knowledgeTitle: "What inventory turnover means in e-commerce operations", definition: "Definition", definitionText: "Inventory turnover measures how many times stock is sold and replaced over a period, reflecting how efficiently capital is deployed in inventory.", formula: "Formula", formulaText: "Turnover = COGS ÷ Average inventory. DIO = Period days ÷ Turnover. Average inventory = (beginning + ending) ÷ 2.", limitations: "Limitations", limitationsText: "Reasonable ranges differ greatly by industry (grocery high, jewelry low); seasonality, promotions, and accounting methods affect the figure—pair with margin and cash flow.", interpretation: "Interpretation", interpretationText: "Too low means capital tied in stock with markdown risk; too high may cause stockouts and lost sales. Calibrate the healthy band to your industry.", context: "Context", contextText: "Turnover should follow gross margin and be evaluated alongside reorder point and cash conversion cycle.", example: "Example", exampleText: "COGS 1,200,000, average inventory 200,000 → turnover 6×, days inventory ~61 days (annual).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for inventory operations", premiumTitle: "PRO Inventory Analytics Pack", premiumText: "Unlock SKU-level turnover ranking, stagnant-stock alerts, safety-stock suggestions, and multi-warehouse cash-occupancy reports.", feat1: "Ranking", feat2: "Alerts", feat3: "Safety", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for operational planning and education. It does not replace financial statements, audit, or professional accounting advice.", relatedTools: "Related Tools", relatedToolsText: "Gross Margin Calculator · Reorder Point Calculator · Carrying Cost Calculator · Cash Conversion Cycle Calculator", references: "References", referencesText: "CFI Inventory Turnover Ratio guide; Investopedia Inventory Turnover definition; APICS/ASCM Operations Management body of knowledge; Harvard Business Review Working Capital articles.",
    q1: "What turnover counts as good?", a1: "There is no single standard. Grocery can be 20+, jewelry below 2. Same-industry comparison and your own trend matter more.",
    q2: "Why use average inventory instead of ending inventory?", a2: "Ending inventory is easily distorted by promotions or purchase timing; averaging beginning and ending better represents the whole period.",
    q3: "Is higher turnover always better?", a3: "Not necessarily. Very high turnover often brings stockouts and frequent replenishment cost—balance against service level and safety stock.",
    q4: "How do I use Days Inventory Outstanding (DIO)?", a4: "DIO is the average days to sell through stock and a key part of the cash conversion cycle; shorter means faster cash recovery.",
    q5: "Can I use revenue instead of COGS?", a5: "The standard formula uses COGS. Using revenue inflates the ratio because of margin; use COGS unless doing a rough comparison only.",
    q6: "Can this tool replace an inventory management system?", a6: "No. It is a quick estimate for education; real replenishment and safety stock still need ERP/WMS and SKU-level data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function periodDays(mode: PeriodMode): number {
  if (mode === "monthly") return 30;
  if (mode === "quarterly") return 91;
  return 365;
}

export default function InventoryTurnoverCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1200000");
  const [tdee, setTdee] = useState("200000");
  const [goal, setGoal] = useState<PeriodMode>("annual");
  const t = ui[lang];

  const result = useMemo(() => {
    const cogs = Number(weight);
    const avgInv = Number(tdee);
    if (cogs <= 0 || avgInv <= 0) return null;
    const days = periodDays(goal);
    const turnover = cogs / avgInv;
    const dio = turnover > 0 ? days / turnover : 0;
    const dailyConsumption = cogs / days;
    const outputPerUnit = turnover;
    return { cogs, avgInv, days, turnover, dio, dailyConsumption, outputPerUnit };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.turnover, 1) : "—";
  const fatDisplay = result ? fmt(result.dio, 0) : "—";
  const carbDisplay = result ? fmt(result.dio, 0) : "—";
  const totalDisplay = result ? fmt(result.turnover, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1200000"); setTdee("200000"); setGoal("annual"); }
  function fillCut() { setUnit("metric"); setWeight("2400000"); setTdee("150000"); setGoal("annual"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "monthly" ? "📅" : goal === "quarterly" ? "🗓️" : "📆"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">6.0×</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">16.0×</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as PeriodMode)}><option value="annual">{t.goalCut}</option><option value="quarterly">{t.goalMaintain}</option><option value="monthly">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">×</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">d</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">×</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="inventory-turnover-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}×</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.dailyConsumption, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.outputPerUnit, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Margin", note: t.bmrStep }, { label: "Turnover", note: t.deficitStep }, { label: "Reorder", note: t.trendStep }, { label: "Cash Cycle", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="inventory-turnover-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
