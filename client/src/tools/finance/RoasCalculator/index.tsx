// @profile B
// Profile B · 計算機-YMYL · ROAS計算機（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "loss", range: "<1.0x", label: { zh: "虧損", en: "Loss" }, desc: { zh: "廣告收入低於花費,需立即檢查投放。", en: "Revenue below ad spend; review the campaign immediately." } },
  { key: "weak", range: "1.0–2.0x", label: { zh: "偏弱", en: "Weak" }, desc: { zh: "可能低於多數商品的損益兩平需求。", en: "Likely below break-even for most product margins." } },
  { key: "ok", range: "2.0–3.0x", label: { zh: "可觀察", en: "Observe" }, desc: { zh: "需要搭配毛利率判斷是否可擴張。", en: "Pair with gross margin before scaling spend." } },
  { key: "good", range: "3.0–4.0x", label: { zh: "良好", en: "Good" }, desc: { zh: "常見健康區間,但仍要看利潤。", en: "Common healthy range, but still confirm profit." } },
  { key: "strong", range: "4.0–6.0x", label: { zh: "強勢", en: "Strong" }, desc: { zh: "具備擴量潛力,可測試預算提升。", en: "Strong scaling potential; test budget increases." } },
  { key: "elite", range: ">6.0x", label: { zh: "卓越", en: "Elite" }, desc: { zh: "高效率投放,需確認歸因與供給能力。", en: "Highly efficient; verify attribution and supply capacity." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "利潤率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "會議成本計算機", en: "Meeting Cost Calculator" }, href: "/tools/finance/meeting-cost-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    fillExample: "一鍵填入標準範例", primaryValue: "主要數值", maintenanceTarget: "主要數值", actionTarget: "次要數值",
    progressInsightCard: "進度洞察", motivationCard: "動力卡片", nextActionsTitle: "下一步行動",
    unitSystem: "單位", metric: "公制", imperial: "英制",
    title: "ROAS Calculator · 廣告投報率計算機", subtitle: "計算廣告投報率、投資回報率、每單取得成本、平均訂單金額與損益兩平投報率", badge: "財務 · 廣告投報率 · 黃金工具",
    intro: "根據廣告花費、廣告歸因收入、銷貨成本與訂單數估算投放效率。本工具僅供教育與規劃參考,不取代正式財務或行銷建議。",
    quick: "快速範例", returnMultiple: "投報倍數", fillStd: "標準範例", fillThin: "低利潤範例",
    examples: "範例 → 計算機", calc: "計算機", examplesHelp: "先用標準範例理解倍數,再換成自己的廣告數據。",
    adSpend: "廣告花費($)", adRevenue: "廣告歸因收入($)", cogs: "銷貨成本($)", orders: "訂單數",
    result: "廣告投報率結果", roi: "扣除廣告後投資回報率", profitAfterAds: "扣除廣告後利潤", cpa: "每單取得成本",
    intelligence: "結果解讀", matrix: "六格廣告投報率效率矩陣", matrixNote: "本區依廣告投報倍數使用固定六格判讀;這是投放規劃參考,不保證實際獲利。",
    emotion: "情緒與轉換層", plan: "把廣告成效轉成預算決策", conversion: "提高廣告預算前,請先比較目前投報率與損益兩平投報率。",
    breakEvenRoas: "損益兩平投報率", aov: "平均訂單金額", save: "儲存 / 分享", saveHint: "素材、受眾、價格或商品成本變動後,請重新試算。",
    next: "下一步工具", n1: "擴大投放前,先使用利潤率計算機確認毛利空間。", n2: "分配現金預算時,可搭配預算比例計算機。", n3: "進行業主層級規劃時,可搭配淨資產計算機。",
    path: "決策路徑", pathTitle: "廣告投報率 → 利潤率 → 預算比例 → 淨資產",
    knowledge: "知識說明", knowledgeTitle: "廣告投報率代表什麼", definition: "定義", definitionText: "廣告投報率顯示每 1 元廣告花費帶來多少廣告歸因收入。",
    formula: "公式", formulaText: "廣告投報率 = 廣告歸因收入 ÷ 廣告花費。扣除廣告後投資回報率 =(收入 − 銷貨成本 − 廣告花費)÷ 廣告花費。每單取得成本 = 廣告花費 ÷ 訂單數。",
    limits: "限制", limitsText: "歸因期間、退款、折扣、固定成本與平台追蹤差異都會影響真實獲利。",
    example: "範例", exampleText: "收入 $12,000、廣告花費 $3,000、銷貨成本 $5,000:廣告投報率 4.00 倍,扣除廣告後利潤 $4,000,投資回報率 133.3%。",
    faq: "常見問題", common: "常見問題", affiliate: "推薦工具", affiliateTitle: "廣告與利潤規劃的下一步工具",
    premiumTitle: "專業版廣告投報率套件", premiumText: "解鎖渠道比較、歸因備註、利潤敏感度與預算擴量報告。",
    trustRef: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育估算;重大預算決策前,請諮詢合格行銷、財務或會計專業人士。",
    related: "相關工具", relatedText: "利潤率 · 預算比例 · 會議成本 · 淨資產", refs: "參考資料", refsText: "Google 廣告投報率說明;Meta 廣告報表說明;Shopify 行銷指標;哈佛商業評論客戶取得分析。",
    q1: "廣告投報率和扣除廣告後投資回報率差在哪裡?", a1: "廣告投報率是廣告收入除以廣告花費,只看投放效率;扣除廣告後投資回報率會把銷貨成本等成本納入,更接近獲利回報。",
    q2: "廣告投報率越高一定越好嗎?", a2: "不一定。高投報率可能來自小規模或低成長投放,仍需搭配訂單量、毛利率、現金流與可擴張性判斷。",
    q3: "損益兩平廣告投報率怎麼解讀?", a3: "損益兩平廣告投報率代表在目前商品成本率下,廣告至少需要達到的收入倍數;低於此數值可能侵蝕毛利。",
    q4: "每單取得成本和平均訂單金額為什麼重要?", a4: "每單取得成本顯示取得一筆訂單的廣告成本,平均訂單金額顯示每筆訂單收入;兩者能幫助判斷是否應調整客單價或投放成本。",
    q5: "可以用總營收而非廣告營收嗎?", a5: "最好使用可歸因於廣告的收入,否則廣告投報率可能高估。若歸因不完整,請把結果視為方向性估算。",
    q6: "這能取代廣告平台報表嗎?", a6: "不能。這是教育估算工具;正式投放決策仍需搭配廣告平台、客戶關係管理資料、會計資料與專業行銷分析。",
  },
  en: {
    fillExample: "Fill the standard example", primaryValue: "Headline number", maintenanceTarget: "Headline number", actionTarget: "Secondary metric",
    progressInsightCard: "Progress insight", motivationCard: "Motivation card", nextActionsTitle: "Next actions",
    unitSystem: "Unit", metric: "Simple", imperial: "Detailed",
    title: "ROAS Calculator", subtitle: "Calculate ROAS, after-ads ROI, cost per acquisition, average order value, and break-even ROAS", badge: "FINANCE · ROAS · GOLD TOOL",
    intro: "Estimate ad efficiency from ad spend, ad-attributed revenue, COGS, and order count. This tool is for educational and planning use only and does not replace professional financial or marketing advice.",
    quick: "Quick example", returnMultiple: "Return multiple", fillStd: "Standard example", fillThin: "Thin-margin example",
    examples: "EXAMPLES → CALCULATOR", calc: "Enter ad spend & revenue", examplesHelp: "Start with the standard example to understand the multiple, then plug in your own ad data.",
    adSpend: "Ad spend ($)", adRevenue: "Ad-attributed revenue ($)", cogs: "Cost of goods sold ($)", orders: "Order count",
    result: "ROAS results", roi: "After-ads ROI", profitAfterAds: "Profit after ads", cpa: "Cost per acquisition",
    intelligence: "RESULT INTERPRETATION", matrix: "Six-band ROAS efficiency matrix", matrixNote: "L7 fixed six bands placing your return multiple into a planning range — this is a campaign-planning reference, not a profit guarantee.",
    emotion: "EMOTION & CONVERSION LAYER", plan: "Turn ad performance into a budget decision", conversion: "Before raising ad budget, compare your current ROAS to your break-even ROAS.",
    breakEvenRoas: "Break-even ROAS", aov: "Average order value", save: "Save / share", saveHint: "Re-run the calculation when creative, audience, price, or COGS change.",
    next: "NEXT-STEP TOOLS", n1: "Before scaling, use Profit Margin to confirm gross-margin headroom.", n2: "When allocating cash budget, pair with Budget Ratio.", n3: "For owner-level planning, pair with Net Worth.",
    path: "DECISION PATH", pathTitle: "ROAS → Profit Margin → Budget Ratio → Net Worth",
    knowledge: "KNOWLEDGE", knowledgeTitle: "What ROAS represents", definition: "Definition", definitionText: "ROAS shows how much ad-attributed revenue every $1 of ad spend delivers.",
    formula: "Formula", formulaText: "ROAS = ad revenue ÷ ad spend. After-ads ROI = (revenue − COGS − ad spend) ÷ ad spend. CPA = ad spend ÷ orders.",
    limits: "Limits", limitsText: "Attribution window, refunds, discounts, fixed costs, and platform tracking gaps all affect real profit.",
    example: "Example", exampleText: "Revenue $12,000, ad spend $3,000, COGS $5,000: ROAS 4.00x, profit after ads $4,000, ROI 133.3%.",
    faq: "FAQ", common: "Common questions", affiliate: "RECOMMENDED TOOLS", affiliateTitle: "Next-step tools for ad and profit planning",
    premiumTitle: "PRO ROAS suite", premiumText: "Unlock channel comparison, attribution notes, profit sensitivity, and budget-scaling reports.",
    trustRef: "TRUST · RELATED · REFERENCES", trust: "Trust statement", trustText: "This tool is for educational estimation only; for major budget decisions, please consult a qualified marketing, finance, or accounting professional.",
    related: "Related tools", relatedText: "Profit Margin · Budget Ratio · Meeting Cost · Net Worth", refs: "References", refsText: "Google ROAS documentation; Meta ad-reporting documentation; Shopify marketing metrics; Harvard Business Review on customer-acquisition analysis.",
    q1: "What's the difference between ROAS and after-ads ROI?", a1: "ROAS divides ad revenue by ad spend and only measures campaign efficiency; after-ads ROI also subtracts COGS, getting closer to actual profit return.",
    q2: "Is higher ROAS always better?", a2: "Not necessarily. High ROAS may come from small-scale or low-growth campaigns; you still need order volume, gross margin, cash flow, and scalability checks.",
    q3: "How do I read break-even ROAS?", a3: "Break-even ROAS is the minimum revenue multiple needed at current COGS rate; below it, you may be eroding gross margin.",
    q4: "Why are CPA and AOV important?", a4: "CPA shows the ad cost of acquiring one order; AOV shows revenue per order. Together they help decide whether to adjust pricing or ad spend.",
    q5: "Can I use total revenue instead of ad revenue?", a5: "Best practice is ad-attributed revenue; otherwise ROAS may be overstated. If attribution is incomplete, treat the result as directional.",
    q6: "Can this replace ad-platform reports?", a6: "No. This is an educational estimation tool; real campaign decisions still need ad platforms, CRM, accounting data, and professional marketing analysis.",
  },
} as const;

export default function RoasCalculator() {
  const { lang, setLang } = useLanguage();
  const [adSpend, setAdSpend] = useState("3000");
  const [adRevenue, setAdRevenue] = useState("12000");
  const [cogs, setCogs] = useState("5000");
  const [orders, setOrders] = useState("120");
  const t = ui[lang];
  const result = useMemo(() => {
    const spend=Number(adSpend)||0, revenue=Number(adRevenue)||0, cost=Number(cogs)||0, orderCount=Number(orders)||0;
    const roas=spend>0?revenue/spend:0, grossProfit=revenue-cost, profitAfterAds=revenue-cost-spend;
    const roi=spend>0?profitAfterAds/spend*100:0, cpa=orderCount>0?spend/orderCount:0, aov=orderCount>0?revenue/orderCount:0;
    const contributionMargin=revenue>0?grossProfit/revenue:0, breakEvenRoas=contributionMargin>0?1/contributionMargin:0;
    return { roas, grossProfit, profitAfterAds, roi, cpa, aov, contributionMargin, breakEvenRoas };
  }, [adSpend, adRevenue, cogs, orders]);
  function fillStd(){setAdSpend("3000");setAdRevenue("12000");setCogs("5000");setOrders("120");}
  function fillThin(){setAdSpend("5000");setAdRevenue("9000");setCogs("5200");setOrders("80");}
  const activeBand = bands.find(b => { const r = result.roas; if (r<1) return b.key==="loss"; if (r<2) return b.key==="weak"; if (r<3) return b.key==="ok"; if (r<4) return b.key==="good"; if (r<6) return b.key==="strong"; return b.key==="elite"; });
  const knowledgeRows: Array<[string, string]> = [[t.definition, t.definitionText], [t.formula, t.formulaText], [t.limits, t.limitsText], [t.example, t.exampleText]];
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">{lang === "zh" ? "EN" : "中"}</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="text-4xl font-black md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="text-lg leading-8 text-slate-700">{t.intro}</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quick}</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold text-amber-100">{t.returnMultiple}</div><div className="mt-1 text-5xl font-black">{fmt(result.roas,2)}x</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillStd}</button><button onClick={fillThin} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.fillThin}</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examples}</p><h2 className="mt-2 text-3xl font-black">{t.calc}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.examplesHelp}</p><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">{t.adSpend}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={adSpend} onChange={e=>setAdSpend(e.target.value)} /></label><label className="text-sm font-black">{t.adRevenue}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={adRevenue} onChange={e=>setAdRevenue(e.target.value)} /></label><label className="text-sm font-black">{t.cogs}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cogs} onChange={e=>setCogs(e.target.value)} /></label><label className="text-sm font-black">{t.orders}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={orders} onChange={e=>setOrders(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.result}</p><div className="mt-4 text-7xl font-black">{fmt(result.roas,2)}<span className="text-3xl">x</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>{t.roi}</b><p className="text-3xl font-black">{fmt(result.roi,1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>{t.profitAfterAds}</b><p className="text-3xl font-black">${fmt(result.profitAfterAds)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>{t.cpa}</b><p className="text-3xl font-black">${fmt(result.cpa,2)}</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.intelligence}</p><h2 className="mt-2 text-3xl font-black">{t.matrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.matrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item=><div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key===item.key?"border-amber-400 bg-amber-50 ring-2 ring-amber-500":"border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label,lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc,lang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="roas-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotion}</p><h2 className="mt-2 text-3xl font-black">{t.plan}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.conversion}</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">{t.breakEvenRoas}: {fmt(result.breakEvenRoas,2)}x</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">{t.aov}: ${fmt(result.aov,2)}</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">{t.save}</p><p className="mt-2 text-sm text-slate-600">{t.saveHint}</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">{t.next}</p><ul className="mt-2 text-sm leading-6"><li>{t.n1}</li><li>{t.n2}</li><li>{t.n3}</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.path}</p><h2 className="mt-2 text-3xl font-black">{t.pathTitle}</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{knowledgeRows.map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.common}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a])=><details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 FAQ-after AdSlot" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="roas-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item=><a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label,lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">{t.premiumTitle}</h2><p className="mt-3 text-sm leading-6 text-slate-700">{t.premiumText}</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustRef}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.related}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedText}</p></div><div><h2 className="text-xl font-black">{t.refs}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.refsText}</p></div></div></section>
    </div>
  </main>;
}
