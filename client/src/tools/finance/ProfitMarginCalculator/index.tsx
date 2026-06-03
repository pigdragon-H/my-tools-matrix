// @profile B
// Profile B · 計算機-YMYL · ProfitMargin計算機（GOLD-STANDARD-001 compatible）

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
  { label: { zh: "廣告投報率計算機", en: "ROAS 計算機" }, href: "/tools/finance/roas-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio 計算機" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth 計算機" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "稅後薪資計算機", en: "Salary After Tax 計算機" }, href: "/tools/finance/salary-after-tax-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    q1: "毛利率和淨利率差在哪裡？", a1: "毛利率只扣除銷貨成本，淨利率還會扣除營業費用，因此更接近整體獲利能力。",
    q2: "加價率和利潤率一樣嗎？", a2: "不一樣。加價率是毛利除以成本，利潤率是利潤除以收入；同一筆交易的加價率通常會高於利潤率。",
    q3: "淨利率低一定不好嗎？", a3: "不一定。高成長或低毛利高周轉產業可能淨利率較低，仍要搭配現金流、規模與產業基準判斷。",
    q4: "該先提高價格還是降低成本？", a4: "可先用情境分析比較。若需求穩定，提高價格可能最快；若價格敏感，降低銷貨成本或營業費用更安全。",
    q5: "損益兩平件數怎麼用？", a5: "損益兩平件數可估算至少要賣多少單位才覆蓋成本與費用，適合用於定價與銷售目標設定。",
    q6: "這能取代會計報表嗎？", a6: "不能。這只是教育估算工具；稅務、審計、財報與投資決策請諮詢合格會計或財務專業人士。",
  },
  en: {
    q1: "毛利率和淨利率差在哪裡？", a1: "毛利率只扣除銷貨成本，淨利率還會扣除營業費用，因此更接近整體獲利能力。",
    q2: "加價率和利潤率一樣嗎？", a2: "不一樣。加價率是毛利除以成本，利潤率是利潤除以收入；同一筆交易的加價率通常會高於利潤率。",
    q3: "淨利率低一定不好嗎？", a3: "不一定。高成長或低毛利高周轉產業可能淨利率較低，仍要搭配現金流、規模與產業基準判斷。",
    q4: "該先提高價格還是降低成本？", a4: "可先用情境分析比較。若需求穩定，提高價格可能最快；若價格敏感，降低銷貨成本或營業費用更安全。",
    q5: "損益兩平件數怎麼用？", a5: "損益兩平件數可估算至少要賣多少單位才覆蓋成本與費用，適合用於定價與銷售目標設定。",
    q6: "這能取代會計報表嗎？", a6: "不能。這只是教育估算工具；稅務、審計、財報與投資決策請諮詢合格會計或財務專業人士。",
  },
} as const;

export default function ProfitMargin計算機() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
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
    {key:"loss",range:"<0%",label:{zh:"虧損",en:"虧損"},desc:{zh:"淨利為負，需檢查成本或定價。",en:"淨利為負，需檢查成本或定價。"}},
    {key:"thin",range:"0–5%",label:{zh:"薄利",en:"薄利"},desc:{zh:"利潤緩衝很低，抗風險弱。",en:"利潤緩衝很低，抗風險能力較弱。"}},
    {key:"ok",range:"5–15%",label:{zh:"穩定",en:"穩定"},desc:{zh:"常見可持續區間，仍需控管費用。",en:"常見可持續區間，仍需控管費用。"}},
    {key:"good",range:"15–25%",label:{zh:"良好",en:"良好"},desc:{zh:"具備健康利潤與再投資空間。",en:"利潤健康，具備再投資空間。"}},
    {key:"strong",range:"25–40%",label:{zh:"強勢",en:"強勢"},desc:{zh:"商業模式具定價力或成本優勢。",en:"顯示定價力或成本優勢。"}},
    {key:"elite",range:">40%",label:{zh:"卓越",en:"卓越"},desc:{zh:"高利潤模型，需確認可擴張性。",en:"高利潤模型，需確認可擴張性。"}},
  ] as const;
  const activeBand=bands.find(b=>{const m=result.netMargin;if(m<0)return b.key==="loss";if(m<5)return b.key==="thin";if(m<15)return b.key==="ok";if(m<25)return b.key==="good";if(m<40)return b.key==="strong";return b.key==="elite";});
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中 EN</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">財務 · 利潤率 · 黃金工具</p><h1 className="text-4xl font-black md:text-6xl">Profit Margin Calculator · 利潤率計算機</h1><p className="text-xl font-black text-amber-700">計算毛利率、淨利率、加價率與損益兩平件數</p><p className="text-lg leading-8 text-slate-700">根據營收、銷貨成本、營業費用與單價估算獲利能力。本工具僅供教育與規劃參考，不取代正式會計建議。</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">快速範例</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">淨利率</div><div className="mt-1 text-5xl font-black">{fmt(result.netMargin,1)}%</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">標準範例</button><button onClick={fillLow} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">低利潤範例</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">範例 → 計算機</p><h2 className="mt-2 text-3xl font-black">計算機</h2><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">營收（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={revenue} onChange={e=>setRevenue(e.target.value)} /></label><label className="text-sm font-black">銷貨成本（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cogs} onChange={e=>setCogs(e.target.value)} /></label><label className="text-sm font-black">營業費用（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={opex} onChange={e=>setOpex(e.target.value)} /></label><label className="text-sm font-black">單價（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={price} onChange={e=>setPrice(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">利潤率結果</p><div className="mt-4 text-7xl font-black">{fmt(result.netMargin,1)}<span className="text-3xl">%</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>毛利率</b><p className="text-3xl font-black">{fmt(result.grossMargin,1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>淨利</b><p className="text-3xl font-black">${fmt(result.netProfit)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>加價率</b><p className="text-3xl font-black">{fmt(result.markup,1)}%</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">結果解讀</p><h2 className="mt-2 text-3xl font-black">六格利潤率判讀矩陣</h2><p className="mt-2 text-sm leading-6 text-slate-600">L7 依淨利率使用固定六格判讀；這是營運規劃參考，不是正式會計建議。</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item=><div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key===item.key?"border-amber-400 bg-amber-50 ring-2 ring-amber-500":"border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label,displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc,displayLang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="profitmargin-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">情緒與轉換層</p><h2 className="mt-2 text-3xl font-black">把利潤率快照轉成行動方案</h2><p className="mt-2 text-sm leading-6 text-slate-600">用淨利率、毛利率與損益兩平件數判斷該提高價格、降低銷貨成本，或控管營業費用。</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">損益兩平件數： {fmt(result.breakEvenUnits)}</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">毛利： ${fmt(result.grossProfit)}</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">儲存 / 分享</p><p className="mt-2 text-sm text-slate-600">價格、供應商或營業成本變動後，請重新試算。</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">下一步工具</p><ul className="mt-2 text-sm leading-6"><li>使用廣告投報率計算機評估投放回報。</li><li>使用預算比例計算機安排現金配置。</li><li>使用淨資產計算機進行經營者層級規劃。</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">決策路徑</p><h2 className="mt-2 text-3xl font-black">利潤率 → 廣告投報率 → 預算比例 → 淨資產</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">知識說明</p><h2 className="mt-2 text-3xl font-black">利潤率代表什麼</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[["定義","利潤率顯示扣除成本與費用後，營收還能留下多少比例。"],["公式","毛利率 =（營收 − 銷貨成本）÷ 營收。淨利率 =（營收 − 銷貨成本 − 營業費用）÷ 營收。加價率 = 毛利 ÷ 銷貨成本。"],["限制","未納入稅務時點、現金流、庫存時點、退款與業外項目。"],["範例","營收 $100,000、銷貨成本 $45,000、費用 $25,000：淨利 $30,000，淨利率 30%。"]].map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">常見問題</p><h2 className="mt-2 text-3xl font-black">常見問題</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a])=><details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="profitmargin-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">推薦工具</p><h2 className="mt-2 text-3xl font-black">利潤規劃的下一步工具</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item=><a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label,displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">* {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">專業版利潤率套件</h2><p className="mt-3 text-sm leading-6 text-slate-700">解鎖定價情境、銷貨成本敏感度、利潤率趨勢與損益兩平報告。</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">信任聲明 · 相關工具 · 參考資料</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">信任聲明</h2><p className="mt-2 text-sm leading-6 text-slate-700">本工具僅供教育估算；稅務、審計或財務報告決策請諮詢合格會計專業人士。</p></div><div><h2 className="text-xl font-black">相關工具</h2><p className="mt-2 text-sm leading-6 text-slate-700">廣告投報率 · 預算比例 · 淨資產 · 稅後薪資</p></div><div><h2 className="text-xl font-black">參考資料</h2><p className="mt-2 text-sm leading-6 text-slate-700">美國小型企業署定價指南；美國國稅局商業費用說明；投資百科利潤率定義；哈佛商業評論定價策略。</p></div></div></section>
    </div>
  </main>;
}
