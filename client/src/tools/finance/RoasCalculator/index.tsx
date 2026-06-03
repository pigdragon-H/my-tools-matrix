// @profile B
// Profile B · 計算機-YMYL · Roas計算機（GOLD-STANDARD-001 compatible）

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
  { label: { zh: "利潤率計算機", en: "利潤率計算機" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "預算比例計算機", en: "預算比例計算機" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "會議成本計算機", en: "會議成本計算機" }, href: "/tools/finance/meeting-cost-calculator" },
  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    q1: "廣告投報率和扣除廣告後投資回報率差在哪裡？", a1: "廣告投報率是廣告收入除以廣告花費，只看投放效率；扣除廣告後投資回報率會把銷貨成本等成本納入，更接近獲利回報。",
    q2: "廣告投報率越高一定越好嗎？", a2: "不一定。高投報率可能來自小規模或低成長投放，仍需搭配訂單量、毛利率、現金流與可擴張性判斷。",
    q3: "損益兩平廣告投報率怎麼解讀？", a3: "損益兩平廣告投報率代表在目前商品成本率下，廣告至少需要達到的收入倍數；低於此數值可能侵蝕毛利。",
    q4: "每單取得成本和平均訂單金額為什麼重要？", a4: "每單取得成本顯示取得一筆訂單的廣告成本，平均訂單金額顯示每筆訂單收入；兩者能幫助判斷是否應調整客單價或投放成本。",
    q5: "可以用總營收而非廣告營收嗎？", a5: "最好使用可歸因於廣告的收入，否則廣告投報率可能高估。若歸因不完整，請把結果視為方向性估算。",
    q6: "這能取代廣告平台報表嗎？", a6: "不能。這是教育估算工具；正式投放決策仍需搭配廣告平台、客戶關係管理資料、會計資料與專業行銷分析。",
  },
  en: {
    q1: "廣告投報率和扣除廣告後投資回報率差在哪裡？", a1: "廣告投報率是廣告收入除以廣告花費，只看投放效率；扣除廣告後投資回報率會把銷貨成本等成本納入，更接近獲利回報。",
    q2: "廣告投報率越高一定越好嗎？", a2: "不一定。高投報率可能來自小規模或低成長投放，仍需搭配訂單量、毛利率、現金流與可擴張性判斷。",
    q3: "損益兩平廣告投報率怎麼解讀？", a3: "損益兩平廣告投報率代表在目前商品成本率下，廣告至少需要達到的收入倍數；低於此數值可能侵蝕毛利。",
    q4: "每單取得成本和平均訂單金額為什麼重要？", a4: "每單取得成本顯示取得一筆訂單的廣告成本，平均訂單金額顯示每筆訂單收入；兩者能幫助判斷是否應調整客單價或投放成本。",
    q5: "可以用總營收而非廣告營收嗎？", a5: "最好使用可歸因於廣告的收入，否則廣告投報率可能高估。若歸因不完整，請把結果視為方向性估算。",
    q6: "這能取代廣告平台報表嗎？", a6: "不能。這是教育估算工具；正式投放決策仍需搭配廣告平台、客戶關係管理資料、會計資料與專業行銷分析。",
  },
} as const;

export default function Roas計算機() {
  const { lang, setLang } = useLanguage();
  const displayLang: Lang = "zh";
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
    {key:"loss",range:"<1.0x",label:{zh:"虧損",en:"虧損"},desc:{zh:"廣告收入低於花費，需立即檢查投放。",en:"收入低於廣告花費，需立即檢查投放。"}},
    {key:"weak",range:"1.0–2.0x",label:{zh:"偏弱",en:"偏弱"},desc:{zh:"可能低於多數商品損益兩平需求。",en:"可能低於多數商品的損益兩平需求。"}},
    {key:"ok",range:"2.0–3.0x",label:{zh:"可觀察",en:"觀察"},desc:{zh:"需要搭配毛利率判斷是否可擴張。",en:"擴大投放前請先檢查毛利率。"}},
    {key:"good",range:"3.0–4.0x",label:{zh:"良好",en:"良好"},desc:{zh:"常見健康區間，但仍要看利潤。",en:"常見健康區間，但仍需確認利潤。"}},
    {key:"strong",range:"4.0–6.0x",label:{zh:"強勢",en:"強勢"},desc:{zh:"具備擴量潛力，可測試預算提升。",en:"具備擴量潛力，可測試預算提升。"}},
    {key:"elite",range:">6.0x",label:{zh:"卓越",en:"卓越"},desc:{zh:"高效率投放，需確認歸因與供給能力。",en:"效率很高，需確認歸因與供給能力。"}},
  ] as const;
  const activeBand=bands.find(b=>{const r=result.roas;if(r<1)return b.key==="loss";if(r<2)return b.key==="weak";if(r<3)return b.key==="ok";if(r<4)return b.key==="good";if(r<6)return b.key==="strong";return b.key==="elite";});
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中文模式</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">財務 · 廣告投報率 · 黃金工具</p><h1 className="text-4xl font-black md:text-6xl">ROAS Calculator · 廣告投報率計算機</h1><p className="text-xl font-black text-amber-700">計算廣告投報率、投資回報率、每單取得成本、平均訂單金額與損益兩平投報率</p><p className="text-lg leading-8 text-slate-700">根據廣告花費、廣告歸因收入、銷貨成本與訂單數估算投放效率。本工具僅供教育與規劃參考，不取代正式財務或行銷建議。</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">快速範例</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold text-amber-100">投報倍數</div><div className="mt-1 text-5xl font-black">{fmt(result.roas,2)}x</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">標準範例</button><button onClick={fillThin} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">低利潤範例</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">範例 → 計算機</p><h2 className="mt-2 text-3xl font-black">計算機</h2><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">廣告花費（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={adSpend} onChange={e=>setAdSpend(e.target.value)} /></label><label className="text-sm font-black">廣告歸因收入（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={adRevenue} onChange={e=>setAdRevenue(e.target.value)} /></label><label className="text-sm font-black">銷貨成本（$）<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cogs} onChange={e=>setCogs(e.target.value)} /></label><label className="text-sm font-black">訂單數<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={orders} onChange={e=>setOrders(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">廣告投報率結果</p><div className="mt-4 text-7xl font-black">{fmt(result.roas,2)}<span className="text-3xl">x</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>扣除廣告後投資回報率</b><p className="text-3xl font-black">{fmt(result.roi,1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>扣除廣告後利潤</b><p className="text-3xl font-black">${fmt(result.profitAfterAds)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>每單取得成本</b><p className="text-3xl font-black">${fmt(result.cpa,2)}</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">結果解讀</p><h2 className="mt-2 text-3xl font-black">六格廣告投報率效率矩陣</h2><p className="mt-2 text-sm leading-6 text-slate-600">本區依廣告投報倍數使用固定六格判讀；這是投放規劃參考，不保證實際獲利。</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item=><div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key===item.key?"border-amber-400 bg-amber-50 ring-2 ring-amber-500":"border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label,displayLang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc,displayLang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="roas-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">情緒與轉換層</p><h2 className="mt-2 text-3xl font-black">把廣告成效轉成預算決策</h2><p className="mt-2 text-sm leading-6 text-slate-600">提高廣告預算前，請先比較目前投報率與損益兩平投報率。</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">損益兩平投報率： {fmt(result.breakEvenRoas,2)}x</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">平均訂單金額： ${fmt(result.aov,2)}</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">儲存 / 分享</p><p className="mt-2 text-sm text-slate-600">素材、受眾、價格或商品成本變動後，請重新試算。</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">下一步工具</p><ul className="mt-2 text-sm leading-6"><li>擴大投放前，先使用利潤率計算機確認毛利空間。</li><li>分配現金預算時，可搭配預算比例計算機。</li><li>進行業主層級規劃時，可搭配淨資產計算機。</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">決策路徑</p><h2 className="mt-2 text-3xl font-black">廣告投報率 → 利潤率 → 預算比例 → 淨資產</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">知識說明</p><h2 className="mt-2 text-3xl font-black">廣告投報率代表什麼</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[["定義","廣告投報率顯示每 1 元廣告花費帶來多少廣告歸因收入。"],["公式","廣告投報率 = 廣告歸因收入 ÷ 廣告花費。扣除廣告後投資回報率 =（收入 − 銷貨成本 − 廣告花費）÷ 廣告花費。每單取得成本 = 廣告花費 ÷ 訂單數。"],["限制","歸因期間、退款、折扣、固定成本與平台追蹤差異都會影響真實獲利。"],["範例","收入 $12,000、廣告花費 $3,000、銷貨成本 $5,000：廣告投報率 4.00 倍，扣除廣告後利潤 $4,000，投資回報率 133.3%。"]].map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">常見問題</p><h2 className="mt-2 text-3xl font-black">常見問題</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a])=><details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="roas-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">推薦工具</p><h2 className="mt-2 text-3xl font-black">廣告與利潤規劃的下一步工具</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item=><a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label,displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">* {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">專業版廣告投報率套件</h2><p className="mt-3 text-sm leading-6 text-slate-700">解鎖渠道比較、歸因備註、利潤敏感度與預算擴量報告。</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">信任聲明 · 相關工具 · 參考資料</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">信任聲明</h2><p className="mt-2 text-sm leading-6 text-slate-700">本工具僅供教育估算；重大預算決策前，請諮詢合格行銷、財務或會計專業人士。</p></div><div><h2 className="text-xl font-black">相關工具</h2><p className="mt-2 text-sm leading-6 text-slate-700">利潤率 · 預算比例 · 會議成本 · 淨資產</p></div><div><h2 className="text-xl font-black">參考資料</h2><p className="mt-2 text-sm leading-6 text-slate-700">Google 廣告投報率說明；Meta 廣告報表說明；Shopify 行銷指標；哈佛商業評論客戶取得分析。</p></div></div></section>
    </div>
  </main>;
}
