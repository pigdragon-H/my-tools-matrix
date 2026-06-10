// @profile B
// Profile B · 計算機-Finance · Percentage 計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<5%", label: { zh: "極小占比", en: "Tiny share" }, desc: { zh: "百分比極小，常見於誤差、稅率細項或微幅調整。", en: "A very small percentage — typical for error margins, fine tax items, or minor tweaks." } },
  { key: "small", range: "5–15%", label: { zh: "小幅", en: "Small" }, desc: { zh: "小幅比例，常見於折扣、小費或小額增減。", en: "A small ratio — common for discounts, tips, or small increases/decreases." } },
  { key: "moderate", range: "15–30%", label: { zh: "中等", en: "Moderate" }, desc: { zh: "中等比例，常見於儲蓄率、毛利或一般折扣。", en: "A moderate ratio — typical for savings rate, margins, or general discounts." } },
  { key: "large", range: "30–60%", label: { zh: "大幅", en: "Large" }, desc: { zh: "大幅比例，影響顯著，建議再次確認基準值。", en: "A large ratio with significant impact — double-check the base value." } },
  { key: "major", range: "60–100%", label: { zh: "重大", en: "Major" }, desc: { zh: "接近整體，常見於完成度或高占比結構。", en: "Close to the whole — common for completion rates or high-share structures." } },
  { key: "over", range: ">100%", label: { zh: "超額", en: "Over 100%" }, desc: { zh: "超過原值，常見於成長倍增或加成計算。", en: "Exceeds the original value — common for growth multiples or markup calculations." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "GST 多國稅率計算機", en: "GST Calculator" }, href: "/tools/finance/gst-calculator" },
  { label: { zh: "加密貨幣獲利計算機", en: "Crypto Profit Calculator" }, href: "/tools/finance/crypto-profit-calculator" },
  { label: { zh: "彩票稅後實得計算機", en: "Lottery Tax Calculator" }, href: "/tools/finance/lottery-tax-calculator" },
  { label: { zh: "即時匯率查詢器", en: "Currency Exchange Rate" }, href: "/tools/finance/currency-exchange-rate" },
];

const ui = {
  zh: {
    badge: "財務 · 百分比換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Percentage Calculator · 百分比計算機", subtitle: "一站算出百分比值、增減幅度與占比",
    intro: "本工具依輸入的基準值與百分比，立即算出「X% 是多少」、「X 是 Y 的百分之幾」與「增減百分比」，並把結果放進常見比例區間，協助快速判讀折扣、稅率、毛利與成長。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅做數學百分比換算；不含複利、稅務試算或投資建議，實際財務決策請以專業意見為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立百分比範例", examplePreview: "X% 結果預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入增減範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入基準值與百分比", examplesHelper: "先用範例理解百分比計算，再改成自己的數字。",
    metric: "百分比值", imperial: "增減幅度", exampleCards: "範例卡", baselineExample: "標準範例 · 25% of 200", activeExample: "增減範例", flowDemo: "200 · 25%", calculator: "計算機",
    baseValue: "基準值", percentValue: "百分比 (%)", compareValue: "比較值（占比用）", changeFrom: "原始值（增減用）",
    resultCard: "百分比計算結果", primaryValue: "主要數值",
    percentOf: "X% 的值", whatPercent: "占比 (%)", changePercent: "增減幅度 (%)", increaseValue: "增加後", decreaseValue: "減少後",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格百分比區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將百分比值放進常見比例區間；這是換算參考，不是財務或投資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把百分比結果轉成可行判讀", conversionNote: "L9 會連動目前計算結果，顯示百分比值、占比與增減幅度，協助判斷折扣是否划算、占比是否合理、成長是否達標。",
    progressInsight: "進度洞察卡", possibleTarget: "目前百分比計算", dailyGap: "增減後", weeklyTrend: "百分比值", motivation: "動力卡", keepMomentum: "從單次換算走向穩定試算",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的百分比計算帶回家", journeyHint: "每次調整基準值、百分比或比較值時重新計算，追蹤占比與增減是否符合預期。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 GST 計算機把含稅金額換算成不含稅基準", nextActionItem2: "用加密貨幣獲利計算機把增減百分比套用到實際部位", nextActionItem3: "用即時匯率查詢器把百分比結果換成目標幣別",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "百分比 → 稅率 → 獲利 → 匯率", bmrStep: "百分比", deficitStep: "稅率", trendStep: "獲利", mealStep: "匯率",
    knowledge: "知識", knowledgeTitle: "百分比在財務換算中的意義", definition: "定義", definitionText: "百分比是把一個數值表達成「每一百」的比例，常用於折扣、稅率、毛利、成長率與占比，是財務與日常決策最基礎的換算單位。",
    formula: "公式", formulaText: "X% 的值 = 基準值 × (百分比 ÷ 100)。占比 = 比較值 ÷ 基準值 × 100。增減幅度 = (新值 − 原值) ÷ 原值 × 100。",
    limitations: "限制", limitationsText: "本工具只做單層百分比換算；不含複利、連續折扣疊加、稅務細項或匯率波動，多層計算請逐步換算。",
    interpretation: "解讀", interpretationText: "百分比高不代表金額大，百分比低也不代表不重要；關鍵是基準值是什麼、占比相對於誰，以及增減是相對原值還是相對整體。",
    context: "脈絡", contextText: "百分比應搭配基準值、時間區間與比較對象一起看，而不是只看單一數字；同樣 20% 在不同基準下金額差異極大。",
    example: "範例", exampleText: "基準值 200、百分比 25%。X% 的值 = 200 × 0.25 = 50。若原值 200 增加 25%，新值 = 250；減少 25%，新值 = 150。若 50 是 200 的占比，則為 25%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "百分比換算的下一步工具", premiumTitle: "專業版百分比工具包", premiumText: "解鎖多層百分比疊加、折扣鏈試算、增減批次換算與占比結構報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與換算用途，不取代稅務顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "GST 多國稅率計算機 · 加密貨幣獲利計算機 · 彩票稅後實得計算機 · 即時匯率查詢器", references: "參考資料", referencesText: "標準百分比數學定義；財務折扣與毛利換算慣例；增減百分比（percentage change）公式；占比（share）計算指引。",
    q1: "X% 的值和占比有什麼不同？", a1: "X% 的值是「基準值乘上百分比」，例如 200 的 25% 是 50；占比則是「比較值除以基準值」，例如 50 是 200 的 25%。前者算金額，後者算比例。",
    q2: "增減百分比要用哪個值當分母？", a2: "增減幅度永遠以「原始值」為分母：(新值 − 原值) ÷ 原值 × 100。若用新值當分母會低估增幅、高估降幅。",
    q3: "連續折扣可以直接相加嗎？", a3: "不行。先打 8 折再打 9 折不是減 30%，而是 0.8 × 0.9 = 0.72，等於減 28%。多層折扣請逐步相乘，本工具一次只算一層。",
    q4: "百分比可以超過 100% 嗎？", a4: "可以。成長倍增、加成或超標時百分比會超過 100%，例如從 100 增加到 250 是增加 150%。",
    q5: "為什麼增加再減少同樣百分比回不到原值？", a5: "因為分母變了。100 增加 50% 變 150，150 再減 50% 變 75，而非 100，這是百分比相對性造成的常見誤解。",
    q6: "這個工具能取代稅務或投資計算嗎？", a6: "不能。它只做純數學百分比換算；稅務、複利與投資報酬涉及更多變數，請使用對應專業工具或諮詢顧問。",
  },
  en: {
    badge: "Finance · Percentage · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Percentage Calculator", subtitle: "Find a percentage value, change, and share in one place",
    intro: "This tool instantly answers \u201cwhat is X% of Y\u201d, \u201cX is what percent of Y\u201d, and \u201cpercentage increase/decrease\u201d, then places the result into common ratio bands \u2014 helping you read discounts, tax rates, margins, and growth at a glance.",
    trustNoteLabel: "Note:", trustNote: "This tool performs plain percentage math only. It does not include compounding, tax simulation, or investment advice \u2014 rely on professional guidance for real financial decisions.",
    quickActionCard: "Quick example", tryExample: "Build a percentage example", examplePreview: "X% result preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the change example",
    examplesCalculator: "Examples \u2192 Calculator", enterValues: "Enter the base value and percentage", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own case.",
    metric: "Percent of", imperial: "Change", exampleCards: "Example cards", baselineExample: "Standard \u00b7 25% of 200", activeExample: "Change example", flowDemo: "200 \u00b7 25%", calculator: "Calculator",
    baseValue: "Base value", percentValue: "Percentage (%)", compareValue: "Compare value (for share)", changeFrom: "Original value (for change)",
    resultCard: "Percentage result", primaryValue: "Headline number",
    percentOf: "X% value", whatPercent: "Share (%)", changePercent: "Change (%)", increaseValue: "After increase", decreaseValue: "After decrease",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band percentage reading matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 places the percentage value into common ratio ranges. This is a conversion reference, not financial or investment advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the percentage result into a clear reading", conversionNote: "L9 reflects your current results \u2014 percentage value, share, and change \u2014 to help you judge whether a discount is worth it, a share is reasonable, or growth is on target.",
    progressInsight: "Progress insight", possibleTarget: "Your current percentage calc", dailyGap: "After change", weeklyTrend: "Percentage value", motivation: "Motivation", keepMomentum: "Move from a one-off conversion to steady estimation",
    saveShareJourney: "Save / share", journeyTitle: "Take today\u2019s percentage result home", journeyHint: "Recalculate whenever the base value, percentage, or compare value changes \u2014 and track whether share and change match expectations.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use GST Calculator to convert a tax-inclusive amount into a pre-tax base", nextActionItem2: "Use Crypto Profit Calculator to apply the change percentage to an actual position", nextActionItem3: "Use Currency Exchange Rate to convert the percentage result into a target currency",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Percentage \u2192 Tax \u2192 Profit \u2192 Exchange", bmrStep: "Percentage", deficitStep: "Tax", trendStep: "Profit", mealStep: "Exchange",
    knowledge: "Knowledge", knowledgeTitle: "What percentage means in financial conversion", definition: "Definition", definitionText: "A percentage expresses a value as a ratio per hundred. It is used for discounts, tax rates, margins, growth rates, and shares \u2014 the most basic conversion unit in finance and daily decisions.",
    formula: "Formula", formulaText: "X% value = base \u00d7 (percent \u00f7 100). Share = compare \u00f7 base \u00d7 100. Change = (new \u2212 original) \u00f7 original \u00d7 100.",
    limitations: "Limitations", limitationsText: "This tool performs single-step percentage math only. It does not include compounding, stacked sequential discounts, tax line items, or exchange-rate swings \u2014 convert multi-step cases one stage at a time.",
    interpretation: "Interpretation", interpretationText: "A high percentage does not mean a large amount, and a low percentage is not always unimportant. What matters is the base value, what the share is relative to, and whether change is relative to the original or the whole.",
    context: "Context", contextText: "Read a percentage together with its base value, time range, and comparison target \u2014 not the number alone. The same 20% can mean very different amounts under different bases.",
    example: "Example", exampleText: "Base 200, percentage 25%. X% value = 200 \u00d7 0.25 = 50. Increasing 200 by 25% gives 250; decreasing by 25% gives 150. If 50 is compared to 200, the share is 25%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for percentage conversion", premiumTitle: "Pro Percentage Toolkit", premiumText: "Unlock multi-step percentage stacking, discount-chain simulation, batch change conversion, and share-structure reports.",
    trustReferences: "Trust \u00b7 Related tools \u00b7 References", trust: "Trust", trustText: "This tool is for educational and conversion purposes only and is not a substitute for tax advisory or professional financial planning.", relatedTools: "Related tools", relatedToolsText: "GST Calculator \u00b7 Crypto Profit Calculator \u00b7 Lottery Tax Calculator \u00b7 Currency Exchange Rate", references: "References", referencesText: "Standard percentage math definitions; financial discount and margin conversion conventions; percentage-change formula; share calculation guidelines.",
    q1: "What is the difference between X% value and share?", a1: "The X% value is \u201cbase \u00d7 percentage\u201d \u2014 25% of 200 is 50. Share is \u201ccompare \u00f7 base\u201d \u2014 50 is 25% of 200. The first gives an amount; the second gives a ratio.",
    q2: "Which value is the denominator for percentage change?", a2: "Change always uses the original value as the denominator: (new \u2212 original) \u00f7 original \u00d7 100. Using the new value as the denominator underestimates increases and overstates decreases.",
    q3: "Can sequential discounts simply be added?", a3: "No. A 20%-off followed by 10%-off is not 30% off but 0.8 \u00d7 0.9 = 0.72, i.e. 28% off. Multiply stacked discounts step by step; this tool calculates one step at a time.",
    q4: "Can a percentage exceed 100%?", a4: "Yes. Growth multiples, markups, or overshoots can exceed 100% \u2014 going from 100 to 250 is a 150% increase.",
    q5: "Why doesn\u2019t increasing then decreasing by the same percent return the original?", a5: "Because the denominator changes. 100 increased by 50% is 150; 150 decreased by 50% is 75, not 100. This relativity is a common percentage misconception.",
    q6: "Can this tool replace tax or investment calculations?", a6: "No. It performs pure percentage math only. Tax, compounding, and investment returns involve more variables \u2014 use the matching professional tools or consult an advisor.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PercentageCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [baseValue, setBaseValue] = useState("200");
  const [percentValue, setPercentValue] = useState("25");
  const [compareValue, setCompareValue] = useState("50");
  const t = ui[lang];

  const result = useMemo(() => {
    const base = Number(baseValue) || 0;
    const pct = Number(percentValue) || 0;
    const cmp = Number(compareValue) || 0;
    const percentOf = base * (pct / 100);
    const increaseValue = base * (1 + pct / 100);
    const decreaseValue = base * (1 - pct / 100);
    const sharePercent = base !== 0 ? (cmp / base) * 100 : 0;
    const changePercent = base !== 0 ? ((cmp - base) / base) * 100 : 0;
    return { percentOf, increaseValue, decreaseValue, sharePercent, changePercent };
  }, [baseValue, percentValue, compareValue]);

  const percentOfDisplay = fmt(result.percentOf, 2);
  const shareDisplay = fmt(result.sharePercent, 2);

  function fillSolid() { setUnit("metric"); setBaseValue("200"); setPercentValue("25"); setCompareValue("50"); }
  function fillChange() { setUnit("imperial"); setBaseValue("100"); setPercentValue("50"); setCompareValue("250"); }

  const activeBand = bands.find(b => {
    const r = Math.abs(result.percentOf / (Number(baseValue) || 1)) * 100;
    if (r < 5) return b.key === "tiny";
    if (r < 15) return b.key === "small";
    if (r < 30) return b.key === "moderate";
    if (r < 60) return b.key === "large";
    if (r <= 100) return b.key === "major";
    return b.key === "over";
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-indigo-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-sm leading-6 text-indigo-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{percentOfDisplay}</div><div className="text-sm font-bold text-indigo-100">{percentValue}% of {baseValue}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.percentOf}</div><div className="font-black">{percentOfDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{baseValue} · {percentValue}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.whatPercent}</div><div className="font-black">{shareDisplay}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillChange} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">50</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "基準 200 · 25%" : "Base 200 · 25%"}</p></button><button onClick={fillChange} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">+150%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "100 → 250" : "100 → 250"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.baseValue}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={baseValue} onChange={(e) => setBaseValue(e.target.value)} /></label><label className="block text-sm font-black text-indigo-700">{t.percentValue}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-lg font-bold" value={percentValue} onChange={(e) => setPercentValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.compareValue}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={compareValue} onChange={(e) => setCompareValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.changeFrom}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={baseValue} onChange={(e) => setBaseValue(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{percentOfDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.percentOf} · {percentValue}% of {baseValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.whatPercent}</div><div className="mt-1 text-xl font-black">{shareDisplay}%</div><div className="mt-1 text-xs text-slate-300">{compareValue} / {baseValue}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.increaseValue}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "+百分比" : "+percent"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.increaseValue, 2)}</p><p className="text-sm font-bold text-emerald-700">+{percentValue}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.decreaseValue}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "−百分比" : "−percent"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.decreaseValue, 2)}</p><p className="text-sm font-bold text-blue-700">−{percentValue}%</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.changePercent}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "增減" : "Change"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.changePercent, 1)}%</p><p className="text-sm font-bold text-slate-700">{baseValue} → {compareValue}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="percentage-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{percentOfDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.whatPercent}</div><div className="mt-1 text-3xl font-black text-indigo-950">{shareDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.increaseValue, 2)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "百分比" : "Percent", note: t.bmrStep }, { label: lang === "zh" ? "稅率" : "Tax", note: t.deficitStep }, { label: lang === "zh" ? "獲利" : "Profit", note: t.trendStep }, { label: lang === "zh" ? "匯率" : "Exchange", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="percentage-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["疊加", "折扣鏈", "批次", "報告"] : ["Stacking", "Chain", "Batch", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
