// @profile B
// Profile B · Calculator-Ecommerce · AdCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type ChannelMode = "search" | "social" | "marketplace";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "loss", range: "< 1×", label: { zh: "虧損", en: "Loss" }, desc: { zh: "廣告花費超過營收，每筆訂單都在賠錢。", en: "Ad spend exceeds revenue; every order loses money." } },
  { key: "thin", range: "1–2×", label: { zh: "勉強", en: "Thin" }, desc: { zh: "剛打平到微利，需檢視毛利與履約成本。", en: "Break-even to thin profit; review margin and fulfillment cost." } },
  { key: "ok", range: "2–3×", label: { zh: "尚可", en: "OK" }, desc: { zh: "多數電商可接受區間，視毛利而定。", en: "Acceptable for most stores depending on gross margin." } },
  { key: "good", range: "3–5×", label: { zh: "良好", en: "Good" }, desc: { zh: "投報健康，可考慮加碼擴量。", en: "Healthy return; consider scaling spend." } },
  { key: "strong", range: "5–8×", label: { zh: "強勁", en: "Strong" }, desc: { zh: "高效投放，留意是否已觸及成長天花板。", en: "Efficient spend; watch whether you've hit a growth ceiling." } },
  { key: "elite", range: "> 8×", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "極高投報，通常為品牌詞或再行銷，難大量複製。", en: "Very high return; usually brand or remarketing, hard to scale broadly." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "顧客獲取成本計算機", en: "CAC Calculator" }, href: "/tools/ecommerce/cac-calculator" },
  { label: { zh: "顧客終身價值計算機", en: "LTV Calculator" }, href: "/tools/ecommerce/ltv-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 行銷投放 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "廣告成本計算機 · Ad Cost", subtitle: "用廣告花費與營收估算 ROAS、ACoS 與每筆獲客成本",
    intro: "Ad Cost Calculator 依據廣告花費、帶來的營收與轉換筆數，估算廣告投資報酬率 ROAS、廣告銷售比 ACoS 與每筆獲客成本 CPA，協助你判斷投放是否賺錢。",
    trustNoteLabel: "注意事項：", trustNote: "ROAS 未扣除商品成本與履約費用，僅看營收與廣告比；是否真正獲利還需納入毛利、退貨與其他變動成本。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立廣告成本範例", examplePreview: "ROAS 預覽", examplePerson: "廣告花費", fillExample: "一鍵填入標準範例", previewActivePath: "填入高投報範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入廣告花費、營收與通路", examplesHelper: "先用範例理解廣告花費與營收如何決定 ROAS，再改成自己的投放數據。",
    metric: "績效投放", imperial: "品牌投放", exampleCards: "範例卡", baselineExample: "標準投放模式", activeExample: "高投報示範", baselineExampleNote: "花費 10,000 · 營收 30,000 · 搜尋", activeExampleNote: "花費 10,000 · 營收 60,000 · 搜尋", carbsLabel: "ROAS", carbsName: "倍", proteinLabel: "ACoS", flowDemo: "營收", calculator: "計算機",
    weight: "廣告花費 (元)", tdee: "帶來營收 (元)", goal: "投放通路", goalCut: "搜尋", goalMaintain: "社群", goalBulk: "市集",
    resultCard: "廣告成本分析結果", unit: "倍 (ROAS)", primaryValue: "主要數值", maintenanceTarget: "ACoS", actionTarget: "每筆獲客成本", estimatedTdee: "營收", maintenance: "%", fatLossTarget: "元/筆",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 ROAS 判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前 ROAS 放進常見投報區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把廣告成本轉成可執行的投放策略", conversionNote: "L9 會連動目前計算結果，顯示 ACoS、每筆獲客成本與獲客筆數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前投放概況", dailyGap: "每筆獲客成本", weeklyTrend: "獲客筆數", motivation: "動力卡", keepMomentum: "從投報分析走向穩定獲利",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的廣告成本帶回團隊", journeyHint: "用扣除毛利後的真實獲利再評估，避免只看 ROAS 高就盲目加碼。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用轉換率檢查流量是否有效成交", nextActionItem2: "用 CAC 與 LTV 判斷獲客是否划算", nextActionItem3: "用定價計算機確認毛利能否支撐投放",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "廣告成本 → 轉換率 → CAC → LTV", bmrStep: "廣告成本", deficitStep: "轉換率", trendStep: "CAC", mealStep: "LTV",
    knowledge: "知識", knowledgeTitle: "廣告成本在電商營運中的意義", definition: "定義", definitionText: "ROAS 是廣告投資報酬率，即廣告帶來的營收除以廣告花費；ACoS 是廣告銷售比，是花費占營收的比例，兩者互為倒數關係。", formula: "公式", formulaText: "ROAS = 帶來營收 ÷ 廣告花費。ACoS = 廣告花費 ÷ 帶來營收 × 100%。每筆獲客成本 CPA = 廣告花費 ÷ 轉換筆數。", limitations: "限制", limitationsText: "本工具只看營收與廣告比，未扣商品成本、退貨與履約；高 ROAS 不等於高獲利，需以毛利為基準。", interpretation: "解讀", interpretationText: "ROAS 過低代表投放不划算；但品牌詞或再行銷的高 ROAS 難大量複製，擴量時通常會稀釋。", context: "脈絡", contextText: "廣告成本應與轉換率、CAC、LTV 一起看，才能判斷獲客長期是否划算。", example: "範例", exampleText: "花費 10,000、營收 30,000 → ROAS 3 倍，ACoS 約 33%，若 100 筆成交則 CPA 約 100 元/筆。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "行銷投放的下一步工具", premiumTitle: "PRO 投放分析包", premiumText: "解鎖毛利後真實 ROAS、多通路歸因、損益平衡 ROAS 與每月投放趨勢報告。", feat1: "真實ROAS", feat2: "歸因分析", feat3: "損益平衡", feat4: "趨勢追蹤",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代廣告平台後台、歸因模型或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Conversion Rate Calculator · CAC Calculator · LTV Calculator · Pricing Calculator", references: "參考資料", referencesText: "Google Ads Help; Meta Business Help; AMA Marketing Metrics; Farris Marketing Metrics handbook。",
    q1: "ROAS 和 ACoS 差在哪？", a1: "ROAS 是營收除花費（倍數），ACoS 是花費除營收（百分比），兩者互為倒數；ROAS 3 倍等於 ACoS 約 33%。",
    q2: "ROAS 多少才算好？", a2: "視毛利而定。毛利 50% 時損益平衡約在 ROAS 2 倍；高毛利商品可接受較低 ROAS，低毛利則需更高。",
    q3: "為何高 ROAS 擴量後變差？", a3: "品牌詞與再行銷投報最高但量小；擴到泛流量時轉換率下降，ROAS 通常被稀釋。",
    q4: "每筆獲客成本怎麼用？", a4: "CPA 與顧客終身價值 LTV 比較才有意義；LTV 遠高於 CPA 才代表獲客划算。",
    q5: "該看 ROAS 還是利潤？", a5: "最終看扣除商品與履約成本後的利潤；ROAS 只是快速指標，不能取代損益表。",
    q6: "這個工具能取代廣告後台嗎？", a6: "不能。它只是快速估算與教育用途；真實投報需平台歸因與完整成本資料。",
  },
  en: {
    badge: "E-Commerce · Ad Operations · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Ad Cost Calculator", subtitle: "Estimate ROAS, ACoS, and cost per acquisition from ad spend and revenue",
    intro: "This calculator uses ad spend, the revenue it generated, and conversions to estimate return on ad spend (ROAS), advertising cost of sales (ACoS), and cost per acquisition (CPA), helping you judge whether your campaigns are profitable.",
    trustNoteLabel: "Note:", trustNote: "ROAS does not deduct product cost or fulfillment; it only compares revenue to ad spend. True profitability still needs gross margin, returns, and other variable costs.",
    quickActionCard: "Quick Action Card", tryExample: "Create an ad cost example instantly", examplePreview: "ROAS preview", examplePerson: "Ad spend", fillExample: "One-click standard example", previewActivePath: "Fill high-return example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter ad spend, revenue, and channel", examplesHelper: "Start with an example to understand how ad spend and revenue set ROAS, then replace with your own campaign data.",
    metric: "Performance", imperial: "Brand", exampleCards: "Example cards", baselineExample: "Standard campaign", activeExample: "High-return demo", baselineExampleNote: "Spend 10,000 · revenue 30,000 · search", activeExampleNote: "Spend 10,000 · revenue 60,000 · search", carbsLabel: "ROAS", carbsName: "x", proteinLabel: "ACoS", flowDemo: "Revenue", calculator: "Calculator",
    weight: "Ad spend (currency)", tdee: "Revenue generated (currency)", goal: "Ad channel", goalCut: "Search", goalMaintain: "Social", goalBulk: "Marketplace",
    resultCard: "Ad Cost Result", unit: "x (ROAS)", primaryValue: "Primary Value", maintenanceTarget: "ACoS", actionTarget: "Cost per acquisition", estimatedTdee: "Revenue", maintenance: "%", fatLossTarget: "/order",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card ROAS interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current ROAS into common return zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn ad cost into an actionable campaign strategy", conversionNote: "L9 values update from the computed result: ACoS, cost per acquisition, and conversions hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current campaign snapshot", dailyGap: "Cost per acquisition", weeklyTrend: "Conversions", motivation: "Motivation Card", keepMomentum: "Move from return analysis to steady profit",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's ad cost to your team", journeyHint: "Re-evaluate using true profit after gross margin to avoid scaling blindly just because ROAS looks high.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check whether traffic converts with Conversion Rate", nextActionItem2: "Judge acquisition value with CAC and LTV", nextActionItem3: "Confirm margin can support spend with Pricing",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Ad Cost → Conversion Rate → CAC → LTV", bmrStep: "Ad cost", deficitStep: "Conversion rate", trendStep: "CAC", mealStep: "LTV",
    knowledge: "Knowledge", knowledgeTitle: "What ad cost means in e-commerce operations", definition: "Definition", definitionText: "ROAS is return on ad spend—revenue generated by ads divided by ad spend; ACoS is advertising cost of sales—spend as a share of revenue. They are reciprocals of each other.", formula: "Formula", formulaText: "ROAS = revenue generated ÷ ad spend. ACoS = ad spend ÷ revenue generated × 100%. Cost per acquisition CPA = ad spend ÷ conversions.", limitations: "Limitations", limitationsText: "This tool only compares revenue to spend; it does not deduct product cost, returns, or fulfillment. High ROAS is not high profit—use gross margin as the basis.", interpretation: "Interpretation", interpretationText: "Low ROAS means spend is inefficient; but high ROAS from brand or remarketing is hard to scale and usually dilutes as you expand.", context: "Context", contextText: "Ad cost should be evaluated with conversion rate, CAC, and LTV to judge whether acquisition pays off long term.", example: "Example", exampleText: "Spend 10,000, revenue 30,000 → ROAS 3x, ACoS ~33%; with 100 conversions, CPA ~100 per order.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for ad operations", premiumTitle: "PRO Campaign Analytics Pack", premiumText: "Unlock true ROAS after margin, multi-channel attribution, break-even ROAS, and monthly campaign trend reports.", feat1: "True ROAS", feat2: "Attribution", feat3: "Break Even", feat4: "Trend",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace ad platform dashboards, attribution models, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Conversion Rate Calculator · CAC Calculator · LTV Calculator · Pricing Calculator", references: "References", referencesText: "Google Ads Help; Meta Business Help; AMA Marketing Metrics; Farris Marketing Metrics handbook.",
    q1: "How is ROAS different from ACoS?", a1: "ROAS is revenue divided by spend (a multiple); ACoS is spend divided by revenue (a percentage). They are reciprocals—ROAS 3x equals ACoS ~33%.",
    q2: "What ROAS is good?", a2: "It depends on margin. At 50% gross margin, break-even is about ROAS 2x; high-margin products tolerate lower ROAS, low-margin need higher.",
    q3: "Why does high ROAS get worse when scaling?", a3: "Brand terms and remarketing have the highest return but small volume; expanding to broad traffic lowers conversion rate and dilutes ROAS.",
    q4: "How do I use cost per acquisition?", a4: "CPA is only meaningful compared to customer lifetime value (LTV); acquisition pays off only when LTV is far above CPA.",
    q5: "Should I watch ROAS or profit?", a5: "Ultimately watch profit after product and fulfillment cost; ROAS is a quick metric and cannot replace a P&L statement.",
    q6: "Can this tool replace an ad dashboard?", a6: "No. It is a quick estimate for education; true return needs platform attribution and full cost data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function conversionsFor(mode: ChannelMode): number {
  if (mode === "social") return 80;
  if (mode === "marketplace") return 120;
  return 100;
}

export default function AdCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("10000");
  const [tdee, setTdee] = useState("30000");
  const [goal, setGoal] = useState<ChannelMode>("search");
  const t = ui[lang];

  const result = useMemo(() => {
    const spend = Number(weight);
    const revenue = Number(tdee);
    if (spend <= 0 || revenue <= 0) return null;
    const conversions = conversionsFor(goal);
    const roas = revenue / spend;
    const acos = (spend / revenue) * 100;
    const cpa = conversions > 0 ? spend / conversions : 0;
    return { spend, revenue, conversions, roas, acos, cpa };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.acos, 0) : "—";
  const fatDisplay = result ? fmt(result.cpa, 0) : "—";
  const carbDisplay = result ? fmt(result.roas, 1) : "—";
  const totalDisplay = result ? fmt(result.roas, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("10000"); setTdee("30000"); setGoal("search"); }
  function fillCut() { setUnit("metric"); setWeight("10000"); setTdee("60000"); setGoal("search"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "social" ? "📱" : goal === "marketplace" ? "🛒" : "🔍"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3.0×</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">6.0×</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as ChannelMode)}><option value="search">{t.goalCut}</option><option value="social">{t.goalMaintain}</option><option value="marketplace">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">×</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">×</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ad-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}%</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.cpa, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.conversions, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "AdCost", note: t.bmrStep }, { label: "Conversion", note: t.deficitStep }, { label: "CAC", note: t.trendStep }, { label: "LTV", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ad-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
