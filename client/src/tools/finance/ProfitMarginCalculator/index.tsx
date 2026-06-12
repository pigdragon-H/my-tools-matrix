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

const bands = [
  { key: "loss", range: "<0%", label: { zh: "虧損", en: "Loss" }, desc: { zh: "淨利為負,需檢查成本或定價。", en: "Net profit is negative; review costs or pricing." } },
  { key: "thin", range: "0–5%", label: { zh: "薄利", en: "Thin" }, desc: { zh: "利潤緩衝很低,抗風險弱。", en: "Very thin profit buffer; low resilience to shocks." } },
  { key: "ok", range: "5–15%", label: { zh: "穩定", en: "Stable" }, desc: { zh: "常見可持續區間,仍需控管費用。", en: "Common sustainable range, but expense control still matters." } },
  { key: "good", range: "15–25%", label: { zh: "良好", en: "Good" }, desc: { zh: "具備健康利潤與再投資空間。", en: "Healthy profit with reinvestment headroom." } },
  { key: "strong", range: "25–40%", label: { zh: "強勢", en: "Strong" }, desc: { zh: "商業模式具定價力或成本優勢。", en: "Business model shows pricing power or cost advantage." } },
  { key: "elite", range: ">40%", label: { zh: "卓越", en: "Elite" }, desc: { zh: "高利潤模型,需確認可擴張性。", en: "High-margin model; verify scalability." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "廣告投報率計算機", en: "ROAS Calculator" }, href: "/tools/finance/roas-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "稅後薪資計算機", en: "Salary After Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    fillExample: "一鍵填入標準範例", primaryValue: "主要數值", maintenanceTarget: "主要數值", actionTarget: "次要數值",
    progressInsightCard: "進度洞察", motivationCard: "動力卡片", nextActionsTitle: "下一步行動",
    unitSystem: "單位", metric: "公制", imperial: "英制",
    title: "Profit Margin Calculator · 利潤率計算機", subtitle: "計算毛利率、淨利率、加價率與損益兩平件數", badge: "財務 · 利潤率 · 黃金工具",
    intro: "根據營收、銷貨成本、營業費用與單價估算獲利能力。本工具僅供教育與規劃參考,不取代正式會計建議。",
    quick: "快速範例", netMarginLabel: "淨利率", fillStd: "標準範例", fillLow: "低利潤範例",
    examples: "範例 → 計算機", calc: "計算機", examplesHelp: "先用標準範例理解利潤結構,再換成自己的營收數據。",
    revenue: "營收($)", cogs: "銷貨成本($)", opex: "營業費用($)", price: "單價($)",
    result: "利潤率結果", grossMargin: "毛利率", netProfit: "淨利", markup: "加價率",
    intelligence: "結果解讀", matrix: "六格利潤率判讀矩陣", matrixNote: "L7 依淨利率使用固定六格判讀;這是營運規劃參考,不是正式會計建議。",
    emotion: "情緒與轉換層", plan: "把利潤率快照轉成行動方案", conversion: "用淨利率、毛利率與損益兩平件數判斷該提高價格、降低銷貨成本,或控管營業費用。",
    breakEvenUnits: "損益兩平件數", grossProfit: "毛利", save: "儲存 / 分享", saveHint: "價格、供應商或營業成本變動後,請重新試算。",
    next: "下一步工具", n1: "使用廣告投報率計算機評估投放回報。", n2: "使用預算比例計算機安排現金配置。", n3: "使用淨資產計算機進行經營者層級規劃。",
    path: "決策路徑", pathTitle: "利潤率 → 廣告投報率 → 預算比例 → 淨資產",
    knowledge: "知識說明", knowledgeTitle: "利潤率代表什麼", definition: "定義", definitionText: "利潤率顯示扣除成本與費用後,營收還能留下多少比例。",
    formula: "公式", formulaText: "毛利率 =(營收 − 銷貨成本)÷ 營收。淨利率 =(營收 − 銷貨成本 − 營業費用)÷ 營收。加價率 = 毛利 ÷ 銷貨成本。",
    limits: "限制", limitsText: "未納入稅務時點、現金流、庫存時點、退款與業外項目。",
    example: "範例", exampleText: "營收 $100,000、銷貨成本 $45,000、費用 $25,000:淨利 $30,000,淨利率 30%。",
    faq: "常見問題", common: "常見問題", affiliate: "推薦工具", affiliateTitle: "利潤規劃的下一步工具",
    premiumTitle: "專業版利潤率套件", premiumText: "解鎖定價情境、銷貨成本敏感度、利潤率趨勢與損益兩平報告。",
    trustRef: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育估算;稅務、審計或財務報告決策請諮詢合格會計專業人士。",
    related: "相關工具", relatedText: "廣告投報率 · 預算比例 · 淨資產 · 稅後薪資", refs: "參考資料", refsText: "美國小型企業署定價指南;美國國稅局商業費用說明;投資百科利潤率定義;哈佛商業評論定價策略。",
    q1: "毛利率和淨利率差在哪裡?", a1: "毛利率只扣除銷貨成本,淨利率還會扣除營業費用,因此更接近整體獲利能力。",
    q2: "加價率和利潤率一樣嗎?", a2: "不一樣。加價率是毛利除以成本,利潤率是利潤除以收入;同一筆交易的加價率通常會高於利潤率。",
    q3: "淨利率低一定不好嗎?", a3: "不一定。高成長或低毛利高周轉產業可能淨利率較低,仍要搭配現金流、規模與產業基準判斷。",
    q4: "該先提高價格還是降低成本?", a4: "可先用情境分析比較。若需求穩定,提高價格可能最快;若價格敏感,降低銷貨成本或營業費用更安全。",
    q5: "損益兩平件數怎麼用?", a5: "損益兩平件數可估算至少要賣多少單位才覆蓋成本與費用,適合用於定價與銷售目標設定。",
    q6: "這能取代會計報表嗎?", a6: "不能。這只是教育估算工具;稅務、審計、財報與投資決策請諮詢合格會計或財務專業人士。",
  },
  en: {
    fillExample: "Fill the standard example", primaryValue: "Headline number", maintenanceTarget: "Headline number", actionTarget: "Secondary metric",
    progressInsightCard: "Progress insight", motivationCard: "Motivation card", nextActionsTitle: "Next actions",
    unitSystem: "Unit", metric: "Simple", imperial: "Detailed",
    title: "Profit Margin Calculator", subtitle: "Calculate gross margin, net margin, markup, and break-even units", badge: "FINANCE · PROFIT MARGIN · GOLD TOOL",
    intro: "Estimate profitability from revenue, COGS, operating expenses, and unit price. This tool is for educational and planning use only and does not replace professional accounting advice.",
    quick: "Quick example", netMarginLabel: "Net margin", fillStd: "Standard example", fillLow: "Thin-margin example",
    examples: "EXAMPLES → CALCULATOR", calc: "Enter revenue & costs", examplesHelp: "Start with the standard example to understand the profit structure, then plug in your own numbers.",
    revenue: "Revenue ($)", cogs: "Cost of goods sold ($)", opex: "Operating expenses ($)", price: "Unit price ($)",
    result: "Profit margin results", grossMargin: "Gross margin", netProfit: "Net profit", markup: "Markup",
    intelligence: "RESULT INTERPRETATION", matrix: "Six-band profit-margin matrix", matrixNote: "L7 fixed six bands placing your net margin into a planning range — this is an operational reference, not formal accounting advice.",
    emotion: "EMOTION & CONVERSION LAYER", plan: "Turn the profit-margin snapshot into an action plan", conversion: "Use net margin, gross margin, and break-even units to decide whether to raise price, lower COGS, or control opex.",
    breakEvenUnits: "Break-even units", grossProfit: "Gross profit", save: "Save / share", saveHint: "Re-run the calculation when price, supplier, or operating costs change.",
    next: "NEXT-STEP TOOLS", n1: "Use ROAS Calculator to evaluate ad-spend return.", n2: "Use Budget Ratio to allocate cash.", n3: "Use Net Worth for owner-level planning.",
    path: "DECISION PATH", pathTitle: "Profit Margin → ROAS → Budget Ratio → Net Worth",
    knowledge: "KNOWLEDGE", knowledgeTitle: "What profit margin represents", definition: "Definition", definitionText: "Profit margin shows what share of revenue remains after subtracting costs and expenses.",
    formula: "Formula", formulaText: "Gross margin = (revenue − COGS) ÷ revenue. Net margin = (revenue − COGS − opex) ÷ revenue. Markup = gross profit ÷ COGS.",
    limits: "Limits", limitsText: "Does not include tax timing, cash flow, inventory timing, refunds, or non-operating items.",
    example: "Example", exampleText: "Revenue $100,000, COGS $45,000, opex $25,000: net profit $30,000, net margin 30%.",
    faq: "FAQ", common: "Common questions", affiliate: "RECOMMENDED TOOLS", affiliateTitle: "Next-step tools for profit planning",
    premiumTitle: "PRO Profit Margin suite", premiumText: "Unlock pricing scenarios, COGS sensitivity, profit-margin trends, and break-even reports.",
    trustRef: "TRUST · RELATED · REFERENCES", trust: "Trust statement", trustText: "This tool is for educational estimation only; for tax, audit, or financial-reporting decisions, please consult a qualified accounting professional.",
    related: "Related tools", relatedText: "ROAS · Budget Ratio · Net Worth · Salary After Tax", refs: "References", refsText: "U.S. SBA pricing guide; IRS business expense documentation; Investopedia profit-margin definition; Harvard Business Review pricing strategy.",
    q1: "What's the difference between gross and net margin?", a1: "Gross margin only subtracts COGS; net margin also subtracts operating expenses, getting closer to overall profitability.",
    q2: "Is markup the same as margin?", a2: "No. Markup is gross profit divided by cost; margin is profit divided by revenue. For the same transaction, markup is usually higher than margin.",
    q3: "Is a low net margin always bad?", a3: "Not necessarily. High-growth or low-margin high-turnover industries may have lower net margin; still factor in cash flow, scale, and industry benchmarks.",
    q4: "Should I raise price or lower cost first?", a4: "Use scenario analysis to compare. If demand is stable, raising price may be fastest; if price-sensitive, lowering COGS or opex is safer.",
    q5: "How do I use break-even units?", a5: "Break-even units estimate the minimum unit volume to cover costs and expenses, useful for pricing and sales-target setting.",
    q6: "Can this replace accounting reports?", a6: "No. This is an educational estimation tool only; for tax, audit, financial reporting, and investment decisions, consult a qualified accounting or finance professional.",
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
  const activeBand = bands.find(b => { const m = result.netMargin; if (m<0) return b.key==="loss"; if (m<5) return b.key==="thin"; if (m<15) return b.key==="ok"; if (m<25) return b.key==="good"; if (m<40) return b.key==="strong"; return b.key==="elite"; });
  const knowledgeRows: Array<[string, string]> = [[t.definition, t.definitionText], [t.formula, t.formulaText], [t.limits, t.limitsText], [t.example, t.exampleText]];
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · lg:grid-cols-[0.9fr_1.1fr] · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}
    <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]"><div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14"><div className="mb-6 flex justify-end"><button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">{lang === "zh" ? "EN" : "中"}</button></div><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="font-black [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="text-lg leading-8 text-slate-700">{t.intro}</p></section><aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quick}</p><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.netMarginLabel}</div><div className="mt-1 text-5xl font-black">{fmt(result.netMargin,1)}%</div></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={fillStd} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillStd}</button><button onClick={fillLow} className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.fillLow}</button></div></aside></div></div></section>
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examples}</p><h2 className="mt-2 text-3xl font-black">{t.calc}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.examplesHelp}</p><div className="mt-6 grid gap-4 md:grid-cols-4"><label className="text-sm font-black">{t.revenue}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={revenue} onChange={e=>setRevenue(e.target.value)} /></label><label className="text-sm font-black">{t.cogs}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={cogs} onChange={e=>setCogs(e.target.value)} /></label><label className="text-sm font-black">{t.opex}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={opex} onChange={e=>setOpex(e.target.value)} /></label><label className="text-sm font-black">{t.price}<input type="number" className="mt-2 w-full rounded-2xl border px-4 py-3" value={price} onChange={e=>setPrice(e.target.value)} /></label></div></section>
      <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.result}</p><div className="mt-4 text-7xl font-black">{fmt(result.netMargin,1)}<span className="text-3xl">%</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><b>{t.grossMargin}</b><p className="text-3xl font-black">{fmt(result.grossMargin,1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><b>{t.netProfit}</b><p className="text-3xl font-black">${fmt(result.netProfit)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><b>{t.markup}</b><p className="text-3xl font-black">{fmt(result.markup,1)}%</p></div></div></article><article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.intelligence}</p><h2 className="mt-2 text-3xl font-black">{t.matrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.matrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map(item=><div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key===item.key?"border-amber-400 bg-amber-50 ring-2 ring-amber-500":"border-slate-200 bg-slate-50"}`}><div className="flex justify-between gap-3"><h3 className="font-black">{l(item.label,lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc,lang)}</p></div>)}</div></article></section>
      <AdSenseWrapper showAds={true} adSlot="profit-margin-result-intelligence" adFormat="horizontal" className="my-2" />
      <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotion}</p><h2 className="mt-2 text-3xl font-black">{t.plan}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.conversion}</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">{t.breakEvenUnits}: {fmt(result.breakEvenUnits)}</h3></article><article className="rounded-3xl bg-white p-5"><h3 className="text-2xl font-black">{t.grossProfit}: ${fmt(result.grossProfit)}</h3></article></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]"><article className="rounded-3xl bg-white p-5"><p className="font-black">{t.save}</p><p className="mt-2 text-sm text-slate-600">{t.saveHint}</p></article><article className="rounded-3xl bg-white p-5"><p className="font-black">{t.next}</p><ul className="mt-2 text-sm leading-6"><li>{t.n1}</li><li>{t.n2}</li><li>{t.n3}</li></ul></article></div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.path}</p><h2 className="mt-2 text-3xl font-black">{t.pathTitle}</h2></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{knowledgeRows.map(([h,p])=><div key={h} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{p}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.common}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q,a])=><details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div></section>
      <section aria-label="L14 FAQ-after AdSlot" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"><AdSlot slot="profit-margin-faq" position="inline" /></section>
      <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map(item=><a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label,lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6"><h2 className="text-3xl font-black">{t.premiumTitle}</h2><p className="mt-3 text-sm leading-6 text-slate-700">{t.premiumText}</p></article></PremiumGate></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustRef}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.related}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedText}</p></div><div><h2 className="text-xl font-black">{t.refs}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.refsText}</p></div></div></section>
    </div>
  </main>;
}
