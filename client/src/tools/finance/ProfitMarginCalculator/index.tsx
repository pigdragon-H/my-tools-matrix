// @profile B
// Profile B · Calculator-YMYL · ProfitMarginCalculator（GOLD-STANDARD-001 compatible）

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
  { label: { zh: "ROAS 計算機", en: "ROAS Calculator" }, href: "/tools/finance/roas-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "稅後薪資計算機", en: "Salary After Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    q1: "毛利率和淨利率差在哪裡？", a1: "毛利率只扣除銷貨成本，淨利率還會扣除營業費用，因此更接近整體獲利能力。",
    q2: "Markup 和 margin 一樣嗎？", a2: "不一樣。Markup 是毛利除以成本，margin 是利潤除以收入；同一筆交易 markup 通常會高於 margin。",
    q3: "淨利率低一定不好嗎？", a3: "不一定。高成長或低毛利高周轉產業可能淨利率較低，仍要搭配現金流、規模與產業基準判斷。",
    q4: "該先提高價格還是降低成本？", a4: "可先用情境分析比較。若需求穩定，提高價格可能最快；若價格敏感，降低 COGS 或營業費用更安全。",
    q5: "損益兩平件數怎麼用？", a5: "損益兩平件數可估算至少要賣多少單位才覆蓋成本與費用，適合用於定價與銷售目標設定。",
    q6: "這能取代會計報表嗎？", a6: "不能。這只是教育估算工具；稅務、審計、財報與投資決策請諮詢合格會計或財務專業人士。",
  },
  en: {
    q1: "What is the difference between gross and net margin?", a1: "Gross margin subtracts cost of goods sold only. Net margin also subtracts operating expenses, so it is closer to overall profitability.",
    q2: "Are markup and margin the same?", a2: "No. Markup is gross profit divided by cost, while margin is profit divided by revenue. For the same sale, markup is usually higher than margin.",
    q3: "Is a low net margin always bad?", a3: "Not always. High-growth or high-volume industries may run lower margins. Compare against cash flow, scale, and industry benchmarks.",
    q4: "Should I raise price or reduce cost first?", a4: "Use scenario analysis. If demand is stable, price may move fastest; if customers are price-sensitive, reducing COGS or operating expenses may be safer.",
    q5: "How should I use break-even units?", a5: "Break-even units estimate how many units must be sold to cover costs and expenses. It is useful for pricing and sales target planning.",
    q6: "Can this replace accounting statements?", a6: "No. It is an educational estimator only. For tax, audit, reporting, or investment decisions, consult a qualified accounting or finance professional.",
  },
} as const;

export default function ProfitMarginCalculator() {
  const { lang, setLang } = useLanguage();
  const [revenue, setRevenue] = useState("100000");
  const [cogs, setCogs] = useState("45000");
  const [opex, setOpex] = useState("25000");
  const [price, setPrice] = useState("100");
  const t = ui[lang];
  const result = useMemo(() => {
    const r=Number(revenue)||0, c=Number(cogs)||0, o=Number(opex)||0, pr=Number(price)||0;
    const grossProfit=r-c, netProfit=r-c-o;
    const grossMargin=r>0?grossProfit/r*100:0, netMargin=r>0?netProfit/r*100:0;
    const markup=c>0?grossProfit/c*100:0, breakEvenUnits=pr>0?Math.ceil((c+o)/pr):0;
    return { grossProfit, netProfit, grossMargin, netMargin, markup, breakEvenUnits };
  }, [revenue,cogs,opex,price]);
  function fillStd(){setRevenue("100000");setCogs("45000");setOpex("25000");setPrice("100");}
  function fillLow(){setRevenue("50000");setCogs("35000");setOpex("12000");setPrice("80");}
  const bands=[
    {key:"loss",range:"<0%",label:{zh:"虧損",en:"Loss"},desc:{zh:"淨利為負，需檢查成本或定價。",en:"Negative net profit; review cost or pricing."}},
    {key:"thin",range:"0–5%",label:{zh:"薄利",en:"Thin"},desc:{zh:"利潤緩衝很低，抗風險弱。",en:"Low buffer and weak resilience."}},
    {key:"ok",range:"5–15%",label:{zh:"穩定",en:"Stable"},desc:{zh:"常見可持續區間，仍需控管費用。",en:"Common sustainable zone; keep expenses controlled."}},
    {key:"good",range:"15–25%",label:{zh:"良好",en:"Good"},desc:{zh:"具備健康利潤與再投資空間。",en:"Healthy profit with reinvestment room."}},
    {key:"strong",range:"25–40%",label:{zh:"強勢",en:"Strong"},desc:{zh:"商業模式具定價力或成本優勢。",en:"Shows pricing power or cost advantage."}},
    {key:"elite",range:">40%",label:{zh:"卓越",en:"Elite"},desc:{zh:"高利潤模型，需確認可擴張性。",en:"High-margin model; validate scalability."}},
  ] as const;
  const activeBand=bands.find(b=>{const m=result.netMargin;if(m<0)return b.key==="loss";if(m<5)return b.key==="thin";if(m<15)return b.key==="ok";if(m<25)return b.key==="good";if(m<40)return b.key==="strong";return b.key==="elite";});
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中 EN</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">FINANCE · PROFIT MARGIN · GOLD TOOL</p><h1 className="text-4xl font-black md:text-6xl">Profit Margin Calculator · 利潤率計算機</h1><p className="text-xl font-black text-amber-700">Calculate gross margin, net margin, markup, and break-even units</p><p className="text-lg leading-8 text-slate-700">Estimate business profitability from revenue, cost of goods sold, operating expenses, and unit price. This is educational planning, not accounting advice.</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Quick example</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">Net margin</div><div className="mt-1 text-5xl font-black">{fmt(result.netMargin,1)}%</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">Standard example</button><button onClick={fillLow} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">Low-margin example</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Examples → Calculator</p><h2 className="mt-2 text-3xl font-black">Calculator</h2><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">Revenue ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={revenue} onChange={e=>setRevenue(e.target.value)} /></label><label className="text-sm font-black">COGS ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cogs} onChange={e=>setCogs(e.target.value)} /></label><label className="text-sm font-black">Operating expenses ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={opex} onChange={e=>setOpex(e.target.value)} /></label><label className="text-sm font-black">Unit price ($)<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={price} onChange={e=>setPrice(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Profit Margin Result</p><div className="mt-4 text-7xl font-black">{fmt(result.netMargin,1)}<span className="text-3xl">%</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>Gross margin</b><p className="text-3xl font-black">{fmt(result.grossMargin,1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>Net profit</b><p className="text-3xl font-black">${fmt(result.netProfit)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>Markup</b><p className="text-3xl font-black">{fmt(result.markup,1)}%</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Result Intelligence</p><h2 className="mt-2 text-3xl font-black">Six-card profit margin matrix</h2><p className="mt-2 text-sm leading-6 text-slate-600">L7 uses six fixed cards based on net margin. This is business planning guidance, not accounting advice.</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item=><div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key===item.key?"border-amber-400 bg-amber-50 ring-2 ring-amber-500":"border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label,lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc,lang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="profitmargin-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">Emotion + Conversion Layer</p><h2 className="mt-2 text-3xl font-black">Turn margin snapshot into an action plan</h2><p className="mt-2 text-sm leading-6 text-slate-600">Use net margin, gross margin, and break-even units to decide whether to raise price, reduce COGS, or control operating expenses.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">Break-even units: {fmt(result.breakEvenUnits)}</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">Gross profit: ${fmt(result.grossProfit)}</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">Save / Share</p><p className="mt-2 text-sm text-slate-600">Recalculate after pricing, vendor, or operating cost changes.</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">Next tools</p><ul className="mt-2 text-sm leading-6"><li>Use ROAS Calculator for campaign return.</li><li>Use Budget Ratio Calculator for cash allocation.</li><li>Use Net Worth Calculator for owner-level planning.</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Decision Path</p><h2 className="mt-2 text-3xl font-black">Profit Margin → ROAS → Budget Ratio → Net Worth</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Knowledge</p><h2 className="mt-2 text-3xl font-black">What profit margin means</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[["Definition","Profit margin shows how much revenue remains after costs and expenses."],["Formula","Gross margin = (Revenue − COGS) ÷ Revenue. Net margin = (Revenue − COGS − Operating expenses) ÷ Revenue. Markup = Gross profit ÷ COGS."],["Limitations","Excludes tax timing, cash flow, inventory timing, refunds, and non-operating items."],["Example","Revenue $100,000, COGS $45,000, expenses $25,000: net profit $30,000 and net margin 30%."]].map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">FAQ</p><h2 className="mt-2 text-3xl font-black">Common questions</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a])=><details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="profitmargin-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Recommended Tools</p><h2 className="mt-2 text-3xl font-black">Next-step tools for margin planning</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item=><a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label,lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">* Affiliate disclosure: affiliate links. We may earn a commission.</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">PRO Profit Margin Pack</h2><p className="mt-3 text-sm leading-6 text-slate-700">Unlock pricing scenarios, COGS sensitivity, margin trend, and break-even reports.</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Trust · Related Tools · References</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">Trust disclaimer</h2><p className="mt-2 text-sm leading-6 text-slate-700">Educational estimator only; consult an accountant for tax, audit, or financial reporting decisions.</p></div><div><h2 className="text-xl font-black">Related tools</h2><p className="mt-2 text-sm leading-6 text-slate-700">ROAS · Budget Ratio · Net Worth · Salary After Tax</p></div><div><h2 className="text-xl font-black">References</h2><p className="mt-2 text-sm leading-6 text-slate-700">SBA pricing guidance; IRS business expense guidance; Investopedia margin definitions; Harvard Business Review pricing strategy.</p></div></div></section>
    </div>
  </main>;
}
