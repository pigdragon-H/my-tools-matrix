// @profile B
// Profile B · Calculator-YMYL · RoasCalculator（GOLD-STANDARD-001 compatible）

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

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "利潤率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "會議成本計算機", en: "Meeting Cost Calculator" }, href: "/tools/finance/meeting-cost-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    q1: "ROAS 和 ROI 差在哪裡？", a1: "ROAS 是廣告收入除以廣告花費，只看投放效率；ROI 會把 COGS 等成本納入，更接近獲利回報。",
    q2: "ROAS 越高一定越好嗎？", a2: "不一定。高 ROAS 可能來自小規模或低成長投放，仍需搭配訂單量、毛利率、現金流與可擴張性判斷。",
    q3: "損益兩平 ROAS 怎麼解讀？", a3: "損益兩平 ROAS 代表在目前商品成本率下，廣告至少需要達到的收入倍數；低於此數值可能侵蝕毛利。",
    q4: "CPA 和 AOV 為什麼重要？", a4: "CPA 顯示取得一筆訂單的廣告成本，AOV 顯示平均訂單收入；兩者能幫助判斷是否應調整客單價或投放成本。",
    q5: "可以用總營收而非廣告營收嗎？", a5: "最好使用可歸因於廣告的收入，否則 ROAS 可能高估。若歸因不完整，請把結果視為方向性估算。",
    q6: "這能取代廣告平台報表嗎？", a6: "不能。這是教育估算工具；正式投放決策仍需搭配廣告平台、CRM、會計資料與專業行銷分析。",
  },
  en: {
    q1: "What is the difference between ROAS and ROI?", a1: "ROAS divides advertising revenue by ad spend and focuses on media efficiency. ROI includes costs such as COGS, so it is closer to profitability.",
    q2: "Is higher ROAS always better?", a2: "Not always. High ROAS can come from small scale or conservative campaigns. Compare it with order volume, margin, cash flow, and scalability.",
    q3: "How should I read break-even ROAS?", a3: "Break-even ROAS is the revenue multiple needed to cover product cost at the current margin structure. Below that level, ads may erode contribution profit.",
    q4: "Why do CPA and AOV matter?", a4: "CPA shows ad cost per order, while AOV shows average order revenue. Together they help decide whether to improve pricing, bundles, or acquisition cost.",
    q5: "Can I use total revenue instead of ad-attributed revenue?", a5: "Use ad-attributed revenue when possible. Total revenue can overstate ROAS; if attribution is incomplete, treat the result as directional.",
    q6: "Can this replace ad platform reporting?", a6: "No. It is an educational estimator. Campaign decisions should also use ad platform data, CRM data, accounting records, and qualified marketing analysis.",
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
  const bands=[
    {key:"loss",range:"<1.0x",label:{zh:"虧損",en:"Loss"},desc:{zh:"廣告收入低於花費，需立即檢查投放。",en:"Revenue is below spend; inspect campaigns quickly."}},
    {key:"weak",range:"1.0–2.0x",label:{zh:"偏弱",en:"Weak"},desc:{zh:"可能低於多數商品損益兩平需求。",en:"May be below break-even for many products."}},
    {key:"ok",range:"2.0–3.0x",label:{zh:"可觀察",en:"Watch"},desc:{zh:"需要搭配毛利率判斷是否可擴張。",en:"Check margin before scaling."}},
    {key:"good",range:"3.0–4.0x",label:{zh:"良好",en:"Good"},desc:{zh:"常見健康區間，但仍要看利潤。",en:"Often healthy, but profit still matters."}},
    {key:"strong",range:"4.0–6.0x",label:{zh:"強勢",en:"Strong"},desc:{zh:"具備擴量潛力，可測試預算提升。",en:"Potential to scale with budget tests."}},
    {key:"elite",range:">6.0x",label:{zh:"卓越",en:"Elite"},desc:{zh:"高效率投放，需確認歸因與供給能力。",en:"Very efficient; validate attribution and supply."}},
  ] as const;
  const activeBand=bands.find(b=>{const r=result.roas;if(r<1)return b.key==="loss";if(r<2)return b.key==="weak";if(r<3)return b.key==="ok";if(r<4)return b.key==="good";if(r<6)return b.key==="strong";return b.key==="elite";});
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中 EN</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">FINANCE · ROAS · GOLD TOOL</p><h1 className="text-4xl font-black md:text-6xl">ROAS Calculator · 廣告投報率計算機</h1><p className="text-xl font-black text-amber-700">Calculate ROAS, ROI, CPA, AOV, and break-even ROAS</p><p className="text-lg leading-8 text-slate-700">Estimate advertising efficiency from ad spend, attributed revenue, cost of goods sold, and order volume. This is educational planning, not financial or marketing advice.</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Quick example</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">ROAS</div><div className="mt-1 text-5xl font-black">{fmt(result.roas,2)}x</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">Standard example</button><button onClick={fillThin} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">Thin-margin example</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Examples → Calculator</p><h2 className="mt-2 text-3xl font-black">Calculator</h2><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">Ad spend ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={adSpend} onChange={e=>setAdSpend(e.target.value)} /></label><label className="text-sm font-black">Ad-attributed revenue ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={adRevenue} onChange={e=>setAdRevenue(e.target.value)} /></label><label className="text-sm font-black">COGS ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cogs} onChange={e=>setCogs(e.target.value)} /></label><label className="text-sm font-black">Orders<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={orders} onChange={e=>setOrders(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">ROAS Result</p><div className="mt-4 text-7xl font-black">{fmt(result.roas,2)}<span className="text-3xl">x</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>ROI after ads</b><p className="text-3xl font-black">{fmt(result.roi,1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>Profit after ads</b><p className="text-3xl font-black">${fmt(result.profitAfterAds)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>CPA</b><p className="text-3xl font-black">${fmt(result.cpa,2)}</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Result Intelligence</p><h2 className="mt-2 text-3xl font-black">Six-card ROAS efficiency matrix</h2><p className="mt-2 text-sm leading-6 text-slate-600">L7 uses six fixed cards based on ROAS multiple. This is campaign planning guidance, not a guarantee of profit.</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item=><div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key===item.key?"border-amber-400 bg-amber-50 ring-2 ring-amber-500":"border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label,lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc,lang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="roas-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">Emotion + Conversion Layer</p><h2 className="mt-2 text-3xl font-black">Turn ad performance into a budget decision</h2><p className="mt-2 text-sm leading-6 text-slate-600">Compare current ROAS with break-even ROAS before increasing campaign budget.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">Break-even ROAS: {fmt(result.breakEvenRoas,2)}x</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">AOV: ${fmt(result.aov,2)}</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">Save / Share</p><p className="mt-2 text-sm text-slate-600">Recalculate after creative, targeting, price, or product cost changes.</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">Next tools</p><ul className="mt-2 text-sm leading-6"><li>Use Profit Margin Calculator before scaling spend.</li><li>Use Budget Ratio Calculator for cash allocation.</li><li>Use Net Worth Calculator for owner-level planning.</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Decision Path</p><h2 className="mt-2 text-3xl font-black">ROAS → Profit Margin → Budget Ratio → Net Worth</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Knowledge</p><h2 className="mt-2 text-3xl font-black">What ROAS means</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[["Definition","ROAS shows advertising revenue generated per dollar of ad spend."],["Formula","ROAS = Ad-attributed revenue ÷ Ad spend. ROI after ads = (Revenue − COGS − Ad spend) ÷ Ad spend. CPA = Ad spend ÷ orders."],["Limitations","Attribution windows, refunds, discounts, fixed costs, and platform tracking can change true profitability."],["Example","Revenue $12,000, ad spend $3,000, COGS $5,000: ROAS 4.00x, profit after ads $4,000, ROI 133.3%."]].map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">FAQ</p><h2 className="mt-2 text-3xl font-black">Common questions</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a])=><details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="roas-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Recommended Tools</p><h2 className="mt-2 text-3xl font-black">Next-step tools for ad and margin planning</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item=><a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label,lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">* Affiliate disclosure: affiliate links. We may earn a commission.</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">PRO ROAS Pack</h2><p className="mt-3 text-sm leading-6 text-slate-700">Unlock channel comparisons, attribution notes, margin sensitivity, and budget scaling reports.</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Trust · Related Tools · References</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">Trust disclaimer</h2><p className="mt-2 text-sm leading-6 text-slate-700">Educational estimator only; consult qualified marketing, finance, or accounting professionals before major budget decisions.</p></div><div><h2 className="text-xl font-black">Related tools</h2><p className="mt-2 text-sm leading-6 text-slate-700">Profit Margin · Budget Ratio · Meeting Cost · Net Worth</p></div><div><h2 className="text-xl font-black">References</h2><p className="mt-2 text-sm leading-6 text-slate-700">Google Ads ROAS guidance; Meta ads reporting guidance; Shopify marketing metrics; Harvard Business Review customer acquisition analysis.</p></div></div></section>
    </div>
  </main>;
}
