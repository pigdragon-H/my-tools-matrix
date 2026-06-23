// @profile B
// Profile B · 計算機-Finance · LotteryTax 計算機（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 2) => Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—";

const bands = [
  { key: "small", range: "<$10k", label: { zh: "小獎", en: "Small" }, desc: { zh: "小額中獎，部分地區可能免預扣稅或稅率較低。", en: "A small win \\u2014 some regions may have no withholding or a lower rate." } },
  { key: "low", range: "$10k\u2013100k", label: { zh: "中獎", en: "Modest" }, desc: { zh: "中等獎金，多數地區開始預扣，建議確認當地稅率。", en: "A modest prize \\u2014 most regions begin withholding; confirm the local rate." } },
  { key: "mid", range: "$100k\u20131M", label: { zh: "大獎", en: "Large" }, desc: { zh: "大額獎金，預扣稅與級距明顯，建議規劃領取方式。", en: "A large prize \\u2014 withholding and brackets are significant; plan your payout option." } },
  { key: "high", range: "$1M\u201310M", label: { zh: "頭獎級", en: "Jackpot" }, desc: { zh: "頭獎級獎金，稅率達高級距，一次領與年金差異可觀。", en: "Jackpot-level \\u2014 top brackets apply; lump-sum vs annuity differs greatly." } },
  { key: "major", range: "$10M\u2013100M", label: { zh: "巨額", en: "Mega" }, desc: { zh: "巨額獎金，建議搭配稅務與資產規劃專業諮詢。", en: "A mega prize \\u2014 pair with professional tax and wealth planning." } },
  { key: "mega", range: ">$100M", label: { zh: "超級頭獎", en: "Super" }, desc: { zh: "超級頭獎，須完整稅務、信託與長期理財規劃。", en: "A super jackpot \\u2014 requires full tax, trust, and long-term planning." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "即時匯率查詢器", en: "Currency Exchange Rate" }, href: "/tools/finance/currency-exchange-rate" },
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/finance/percentage-calculator" },
  { label: { zh: "加密貨幣獲利計算機", en: "Crypto Profit Calculator" }, href: "/tools/finance/crypto-profit-calculator" },
  { label: { zh: "GST 多國稅率計算機", en: "GST Calculator" }, href: "/tools/finance/gst-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 彩票稅務 · 實得工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Lottery Tax Calculator · 彩票稅後實得計算機", subtitle: "依中獎金額與稅率算出稅後實際可得金額",
    intro: "本工具依輸入的中獎金額、預扣稅率與領取方式（一次領取或分期年金），立即算出彩票或樂透中獎後的稅後實際可得金額，並比較一次領與年金的稅後差異，協助規劃領獎決策與稅務預期。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅做稅後試算；各國/各州稅率、累進級距、地方稅與申報方式不同，實際稅額請以當地稅務機關與彩券發行單位公告為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立中獎範例", examplePreview: "稅後實得預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入年金範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入中獎金額與稅率", examplesHelper: "先用範例理解稅後實得，再改成自己的中獎金額與當地稅率。",
    metric: "一次領取", imperial: "分期年金", exampleCards: "範例卡", baselineExample: "$1M · 稅率 30%", activeExample: "年金範例", flowDemo: "30 年分期", calculator: "計算機",
    weightValue: "中獎金額", purityValue: "預扣稅率 (%)", priceValue: "年金期數（年）", unitHint: "領取方式",
    resultCard: "稅後實得結果", primaryValue: "主要數值",
    pureWeight: "扣稅金額", totalValue: "稅後實得", perGram: "每期實得", grams: "稅後",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格獎金級距判讀矩陣", tdeeMatrixNote: "L7 固定六格，將中獎金額放進常見獎金級距；這是試算參考，不是稅務或法律建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把稅後實得轉成可行判讀", conversionNote: "L9 會連動目前計算結果，顯示稅後實得、扣稅金額與每期可得，協助比較一次領與年金的差異並做領獎決策。",
    progressInsight: "進度洞察卡", possibleTarget: "目前稅後實得", dailyGap: "扣稅金額", weeklyTrend: "稅後實得", motivation: "動力卡", keepMomentum: "從單筆中獎走向長期理財規劃",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的稅後實得帶回家", journeyHint: "不同稅率、不同領取方式或不同期數時重新計算，比較哪種領法稅後實得最高。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用即時匯率查詢器把稅後實得換成本地幣別", nextActionItem2: "用百分比計算機把稅額占比與淨得比例算清楚", nextActionItem3: "用 GST 計算機把含稅消費拆出不含稅基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "彩票 → 匯率 → 百分比 → GST", bmrStep: "彩票", deficitStep: "匯率", trendStep: "百分比", mealStep: "GST",
    knowledge: "知識", knowledgeTitle: "稅後實得在彩票領獎中的意義", definition: "定義", definitionText: "稅後實得是把中獎金額扣除預扣稅後的實際可入袋金額，常用於比較一次領取與分期年金、評估領獎決策與後續理財。",
    formula: "公式", formulaText: "扣稅金額 = 中獎金額 × 稅率 ÷ 100。稅後實得 = 中獎金額 − 扣稅金額。年金模式下每期實得 = 稅後實得 ÷ 年金期數。",
    limitations: "限制", limitationsText: "本工具以單一預扣稅率試算；不含累進級距、地方稅、年金各期再課稅、通膨與投資報酬差異，實際稅後金額可能不同。",
    interpretation: "解讀", interpretationText: "稅率越高，稅後實得越低；一次領取通常先課較高預扣，年金則分期課稅但總領取期程長，需依個人稅務與理財需求取捨。",
    context: "脈絡", contextText: "稅後實得應搭配領取方式、當地稅制與個人稅務級距一起看；年金雖每期金額較小，但可能因分散課稅而降低整體稅負。",
    example: "範例", exampleText: "中獎 $1,000,000、預扣稅率 30%。扣稅金額 = $300,000，稅後實得 = $700,000；若分 30 年年金，每年約 $23,333。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "稅後實得的下一步工具", premiumTitle: "專業版彩票稅務工具包", premiumText: "解鎖多國/多州稅率對照、累進級距試算、一次領 vs 年金現值比較與長期理財規劃報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與試算用途，不取代專業稅務或法律建議，實際領獎稅務請諮詢專業人士。", relatedTools: "相關工具", relatedToolsText: "即時匯率查詢器 · 百分比計算機 · 加密貨幣獲利計算機 · GST 多國稅率計算機", references: "參考資料", referencesText: "美國聯邦彩票預扣稅約 24%（高額另加州稅）；台灣彩券超過 5,000 元課 20% 機會中獎稅；各地稅率與級距以官方公告為準。",
    q1: "稅後實得是怎麼算的？", a1: "稅後實得 = 中獎金額 − 扣稅金額，而扣稅金額 = 中獎金額 × 稅率。例如中獎 100 萬、稅率 30%，扣稅 30 萬，稅後實得 70 萬。",
    q2: "一次領取和年金哪個划算？", a2: "一次領取拿到較大筆但先課高預扣；年金分期領取、分期課稅，可能降低整體稅率，但需考慮通膨與資金運用，視個人需求而定。",
    q3: "稅率要填多少？", a3: "依當地規定填單一預扣稅率（例如美國聯邦約 24%、台灣機會中獎稅 20%）。若有州稅或地方稅，可把合計稅率填入做粗估。",
    q4: "為什麼實際拿到的更少？", a4: "本工具只算單一預扣；若中獎屬高級距，報稅時可能需補繳累進差額，加上地方稅與手續，實得可能再低於試算值。",
    q5: "年金每期會再課稅嗎？", a5: "多數地區年金各期領取時仍需依當年所得課稅，本工具以總稅率粗估稅後實得，年金每期金額為平均分配的參考值。",
    q6: "這個工具能取代報稅嗎？", a6: "不能。它只做領獎稅後粗估；正式稅額需依當地累進級距、扣除額與申報規定計算，重大獎金建議諮詢稅務專業。",
  },
  en: {
    badge: "Finance · Lottery tax · Take-home tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Lottery Tax Calculator", subtitle: "Find your after-tax take-home from the prize amount and rate",
    intro: "This tool computes your after-tax take-home from the prize amount, withholding rate, and payout option (lump sum or annuity) \\u2014 and compares lump-sum vs annuity after tax \\u2014 to help plan your claim decision and tax expectations.",
    trustNoteLabel: "Note:", trustNote: "This tool is an after-tax estimate only. Rates, progressive brackets, local taxes, and filing rules vary by country/state \\u2014 rely on your local tax authority and lottery operator for actual amounts.",
    quickActionCard: "Quick example", tryExample: "Build a winning example", examplePreview: "After-tax preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the annuity example",
    examplesCalculator: "Examples \\u2192 Calculator", enterValues: "Enter the prize amount and rate", examplesHelper: "Start from an example to understand after-tax take-home, then change your prize amount and local rate.",
    metric: "Lump sum", imperial: "Annuity", exampleCards: "Example cards", baselineExample: "$1M · rate 30%", activeExample: "Annuity example", flowDemo: "30-year split", calculator: "Calculator",
    weightValue: "Prize amount", purityValue: "Withholding rate (%)", priceValue: "Annuity years", unitHint: "Payout option",
    resultCard: "After-tax result", primaryValue: "Headline number",
    pureWeight: "Tax withheld", totalValue: "After-tax take-home", perGram: "Per period", grams: "after tax",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band prize matrix", tdeeMatrixNote: "L7 fixed six-band matrix \\u2014 places the prize into common bands. This is an estimate, not tax or legal advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the after-tax estimate into a clear reading", conversionNote: "L9 reflects your current results \\u2014 after-tax take-home, tax withheld, and per-period amount \\u2014 to compare lump-sum vs annuity and decide how to claim.",
    progressInsight: "Progress insight", possibleTarget: "Your current after-tax take-home", dailyGap: "Tax withheld", weeklyTrend: "After-tax take-home", motivation: "Motivation", keepMomentum: "Move from a single win to long-term planning",
    saveShareJourney: "Save / share", journeyTitle: "Take today\\u2019s after-tax result home", journeyHint: "Recalculate for different rates, payout options, or annuity years \\u2014 and compare which option keeps the most after tax.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Currency Exchange Rate to convert the take-home into a local currency", nextActionItem2: "Use Percentage Calculator to clarify the tax share and net ratio", nextActionItem3: "Use GST Calculator to extract a pre-tax base from tax-inclusive spending",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Lottery \\u2192 Exchange \\u2192 Percentage \\u2192 GST", bmrStep: "Lottery", deficitStep: "Exchange", trendStep: "Percentage", mealStep: "GST",
    knowledge: "Knowledge", knowledgeTitle: "What after-tax take-home means when claiming a prize", definition: "Definition", definitionText: "After-tax take-home is the prize amount minus withholding \\u2014 used to compare lump-sum vs annuity, evaluate claim decisions, and plan finances afterward.",
    formula: "Formula", formulaText: "Tax withheld = prize \\u00d7 rate \\u00f7 100. After-tax take-home = prize \\u2212 tax withheld. In annuity mode, per-period = take-home \\u00f7 annuity years.",
    limitations: "Limitations", limitationsText: "This tool uses a single withholding rate. It excludes progressive brackets, local taxes, re-taxation of each annuity payment, inflation, and investment-return differences \\u2014 actual after-tax amounts may differ.",
    interpretation: "Interpretation", interpretationText: "A higher rate means a lower take-home; lump sum usually withholds more upfront, while annuity spreads tax over a longer schedule \\u2014 trade off by your tax and financial needs.",
    context: "Context", contextText: "Read take-home together with the payout option, local tax system, and your tax bracket \\u2014 annuity payments are smaller each period but may lower overall tax via spreading.",
    example: "Example", exampleText: "Prize $1,000,000, withholding 30%. Tax withheld = $300,000, after-tax take-home = $700,000; over a 30-year annuity that\\u2019s about $23,333 per year.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for after-tax planning", premiumTitle: "Pro Lottery Tax Toolkit", premiumText: "Unlock multi-country/state rate tables, progressive-bracket estimation, lump-sum vs annuity present-value comparison, and long-term planning reports.",
    trustReferences: "Trust \\u00b7 Related tools \\u00b7 References", trust: "Trust", trustText: "This tool is for educational and estimation purposes only and is not a substitute for professional tax or legal advice; consult a professional for actual prize taxation.", relatedTools: "Related tools", relatedToolsText: "Currency Exchange Rate \\u00b7 Percentage Calculator \\u00b7 Crypto Profit Calculator \\u00b7 GST Calculator", references: "References", referencesText: "US federal lottery withholding is about 24% (plus state tax on large prizes); Taiwan taxes prizes over NT$5,000 at 20%; local rates and brackets follow official notices.",
    q1: "How is after-tax take-home calculated?", a1: "Take-home = prize \\u2212 tax withheld, where tax withheld = prize \\u00d7 rate. For a $1M prize at 30%, tax is $300k and take-home is $700k.",
    q2: "Is lump sum or annuity better?", a2: "Lump sum gives a larger amount but with higher upfront withholding; annuity pays over time and may lower the overall rate, but consider inflation and use of funds \\u2014 it depends on your needs.",
    q3: "What rate should I enter?", a3: "Enter the single withholding rate per local rules (e.g., US federal ~24%, Taiwan prize tax 20%). If state/local tax applies, enter a combined rate for a rough estimate.",
    q4: "Why is the real amount lower?", a4: "This tool computes a single withholding only; high-bracket prizes may owe extra progressive tax at filing, and with local taxes and fees the take-home can be lower than the estimate.",
    q5: "Is each annuity payment taxed again?", a5: "In most regions annuity payments are taxed as income each year. This tool gives a rough total estimate, and per-period amounts are an evenly split reference value.",
    q6: "Can this tool replace tax filing?", a6: "No. It only gives a rough after-tax estimate; actual tax depends on local brackets, deductions, and filing rules \\u2014 for major prizes, consult a tax professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function LotteryTaxCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=Lump sum, imperial=Annuity
  const [prizeValue, setPrizeValue] = useState("1000000");
  const [rateValue, setRateValue] = useState("30");
  const [yearsValue, setYearsValue] = useState("30");
  const t = ui[lang];

  const result = useMemo(() => {
    const prize = Number(prizeValue) || 0;
    const rate = Number(rateValue) || 0;
    const years = Math.max(1, Number(yearsValue) || 1);
    const tax = prize * (rate / 100);
    const takeHome = prize - tax;
    const perPeriod = unit === "imperial" ? takeHome / years : takeHome;
    return { tax, takeHome, perPeriod, years };
  }, [prizeValue, rateValue, yearsValue, unit]);

  const takeHomeDisplay = fmt(result.takeHome, 0);
  const taxDisplay = fmt(result.tax, 0);
  const perPeriodDisplay = fmt(result.perPeriod, 0);

  function fillSolid() { setUnit("metric"); setPrizeValue("1000000"); setRateValue("30"); setYearsValue("30"); }
  function fillAnnuity() { setUnit("imperial"); setPrizeValue("1000000"); setRateValue("30"); setYearsValue("30"); }

  const activeBand = bands.find(b => {
    const r = result.takeHome;
    if (r < 10000) return b.key === "small";
    if (r < 100000) return b.key === "low";
    if (r < 1000000) return b.key === "mid";
    if (r < 10000000) return b.key === "high";
    if (r < 100000000) return b.key === "major";
    return b.key === "mega";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-indigo-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-sm leading-6 text-indigo-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${takeHomeDisplay}</div><div className="text-sm font-bold text-indigo-100">{rateValue}% · {unit === "imperial" ? `${result.years}y` : t.metric}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.totalValue}</div><div className="font-black">${takeHomeDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.pureWeight}</div><div className="font-black">${taxDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.perGram}</div><div className="font-black">${perPeriodDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillAnnuity} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">$700k</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "一次領取 · 30%" : "Lump sum · 30%"}</p></button><button onClick={fillAnnuity} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">30y</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "分 30 年 · 30%" : "30-year · 30%"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weightValue}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={prizeValue} onChange={(e) => setPrizeValue(e.target.value)} /></label><label className="block text-sm font-black text-indigo-700">{t.purityValue}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-lg font-bold" value={rateValue} onChange={(e) => setRateValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.priceValue}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={yearsValue} onChange={(e) => setYearsValue(e.target.value)} /></label><div><div className="text-sm font-black text-slate-700">{t.unitHint}</div><div className="mt-2 grid grid-cols-2 gap-2"><button className={`rounded-xl px-2 py-3 text-xs font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-2 py-3 text-xs font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${takeHomeDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.totalValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.pureWeight}</div><div className="mt-1 text-xl font-black">${taxDisplay}</div><div className="mt-1 text-xs text-slate-300">{rateValue}%</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.totalValue}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "實得" : "Net"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${takeHomeDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.grams}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.pureWeight}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "稅" : "Tax"}</div><p className="mt-2 text-3xl font-black text-blue-950">${taxDisplay}</p><p className="text-sm font-bold text-blue-700">{rateValue}%</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.perGram}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "每期" : "Period"}</div><p className="mt-2 text-3xl font-black text-slate-950">${perPeriodDisplay}</p><p className="text-sm font-bold text-slate-700">{unit === "imperial" ? `${result.years}y` : t.metric}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="lottery-tax-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">${takeHomeDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.pureWeight}</div><div className="mt-1 text-3xl font-black text-indigo-950">${taxDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.perGram}</div><div className="mt-1 text-3xl font-black text-emerald-950">${perPeriodDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "彩票" : "Lottery", note: t.bmrStep }, { label: lang === "zh" ? "匯率" : "Exchange", note: t.deficitStep }, { label: lang === "zh" ? "百分比" : "Percent", note: t.trendStep }, { label: lang === "zh" ? "GST" : "GST", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題補充區" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="lottery-tax-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多國稅率", "級距", "現值", "報告"] : ["Rates", "Brackets", "PV", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
