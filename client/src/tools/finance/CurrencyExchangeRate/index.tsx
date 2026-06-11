// @profile B
// Profile B · 計算機-Finance · CurrencyExchangeRate 計算機（GOLD-STANDARD-001 compatible）

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
  { key: "micro", range: "<$100", label: { zh: "零用", en: "Pocket" }, desc: { zh: "小額兌換，常見於旅遊現鈔或小費，匯差影響有限。", en: "A small exchange \\u2014 typical for travel cash or tips; spread impact is limited." } },
  { key: "small", range: "$100\u20131k", label: { zh: "日常", en: "Everyday" }, desc: { zh: "日常跨境消費或訂閱，建議留意刷卡匯率與手續費。", en: "Everyday cross-border spending or subscriptions \\u2014 watch card rate and fees." } },
  { key: "mid", range: "$1k\u201310k", label: { zh: "中額", en: "Moderate" }, desc: { zh: "中額匯款或購物，匯率差幾個百分點即有感。", en: "A moderate transfer or purchase \\u2014 a few percent of rate difference is noticeable." } },
  { key: "large", range: "$10k\u2013100k", label: { zh: "大額", en: "Large" }, desc: { zh: "大額匯款，建議比較銀行、匯款商與中間市場匯率。", en: "A large transfer \\u2014 compare banks, transfer services, and the mid-market rate." } },
  { key: "major", range: "$100k\u20131M", label: { zh: "重大", en: "Major" }, desc: { zh: "重大金額，匯率與時機影響大，建議分批或鎖匯。", en: "A major amount \\u2014 rate and timing matter; consider tranches or rate locks." } },
  { key: "corp", range: ">$1M", label: { zh: "企業級", en: "Corporate" }, desc: { zh: "企業級金額，建議專業外匯避險與合約報價。", en: "Corporate-scale \\u2014 use professional FX hedging and contract quotes." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/finance/percentage-calculator" },
  { label: { zh: "金銀價格計算機", en: "Gold Silver Price Calculator" }, href: "/tools/finance/gold-silver-price-calculator" },
  { label: { zh: "加密貨幣獲利計算機", en: "Crypto Profit Calculator" }, href: "/tools/finance/crypto-profit-calculator" },
  { label: { zh: "GST 多國稅率計算機", en: "GST Calculator" }, href: "/tools/finance/gst-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 外匯換算 · 匯率工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Currency Exchange Rate · 即時匯率查詢器", subtitle: "依金額與匯率算出兩種貨幣的兌換金額與反向匯率",
    intro: "本工具依輸入的金額、來源幣別與目標幣別匯率，立即換算兩種貨幣之間的兌換金額與反向匯率，並可加上換匯手續費估算實際到手金額，協助旅遊、跨境購物與匯款時快速判斷划不划算。",
    trustNoteLabel: "注意事項：", trustNote: "此工具以您輸入的匯率試算；實際匯率隨市場即時波動，銀行與匯款商會加上買賣價差與手續費，實際成交請以交易當下報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立換匯範例", examplePreview: "兌換金額預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入歐元範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入金額與匯率", examplesHelper: "先用範例理解換匯，再改成自己的金額與當下查到的匯率。",
    metric: "正向換匯", imperial: "反向換匯", exampleCards: "範例卡", baselineExample: "100 USD · 匯率 31.5", activeExample: "歐元範例", flowDemo: "USD → TWD", calculator: "計算機",
    weightValue: "金額", purityValue: "匯率（1 來源 = ? 目標）", priceValue: "手續費 (%)", unitHint: "換算方向",
    resultCard: "換匯結果", primaryValue: "主要數值",
    pureWeight: "反向匯率", totalValue: "兌換金額", perGram: "手續費", grams: "目標幣別",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格換匯金額區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將兌換金額放進常見換匯區間；這是試算參考，不是即時報價。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把換匯結果轉成可行判讀", conversionNote: "L9 會連動目前計算結果，顯示兌換金額、反向匯率與手續費，協助判斷是否該換匯、選哪個通路或等待更好匯率。",
    progressInsight: "進度洞察卡", possibleTarget: "目前換匯結果", dailyGap: "反向匯率", weeklyTrend: "兌換金額", motivation: "動力卡", keepMomentum: "從單次查詢走向匯率追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的換匯結果帶回家", journeyHint: "每次匯率變動、不同通路或不同手續費時重新計算，比較哪種換法到手最多。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用百分比計算機把手續費與匯差占比算清楚", nextActionItem2: "用金銀價格計算機把貴金屬換成目標幣別估值", nextActionItem3: "用 GST 計算機把含稅購物拆出不含稅基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "匯率 → 百分比 → 金銀 → GST", bmrStep: "匯率", deficitStep: "百分比", trendStep: "金銀", mealStep: "GST",
    knowledge: "知識", knowledgeTitle: "匯率換算在跨境理財中的意義", definition: "定義", definitionText: "匯率換算是把一種貨幣依匯率折算成另一種貨幣的金額，常用於旅遊預算、跨境購物、海外匯款與外幣資產盤點。",
    formula: "公式", formulaText: "兌換金額 = 金額 × 匯率 ×（1 − 手續費率）。反向匯率 = 1 ÷ 匯率，代表 1 單位目標幣別等於多少來源幣別。",
    limitations: "限制", limitationsText: "本工具以您輸入的單一匯率試算；不含買賣價差、跨行費、ATM 海外提領費與即時波動，實際到手金額可能因這些成本而降低。",
    interpretation: "解讀", interpretationText: "匯率越高代表 1 單位來源幣別能換到越多目標幣別；手續費率越高，實際到手越少。買入與賣出匯率不同，換鈔與刷卡也有差。",
    context: "脈絡", contextText: "換匯應搭配通路（銀行、機場、匯款商、信用卡）、時機與手續費一起看；中間市場匯率是基準，各通路報價通常會偏離數個百分點。",
    example: "範例", exampleText: "100 美元、匯率 1 USD = 31.5 TWD、手續費 0.5%。兌換金額 = 100 × 31.5 × 0.995 ≈ 3,134 TWD，反向匯率 ≈ 0.0317（1 TWD ≈ 0.0317 USD）。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "換匯的下一步工具", premiumTitle: "專業版外匯換算工具包", premiumText: "解鎖即時匯率串接、多幣別批次換算、通路費率對照與匯率走勢提醒報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與試算用途，匯率以使用者輸入為準，不取代即時報價或專業外匯建議。", relatedTools: "相關工具", relatedToolsText: "百分比計算機 · 金銀價格計算機 · 加密貨幣獲利計算機 · GST 多國稅率計算機", references: "參考資料", referencesText: "中間市場匯率（mid-market rate）為買賣均價；銀行通常加價 1%–3%；反向匯率為匯率倒數；機場與旅遊兌換點價差通常較大。",
    q1: "兌換金額是怎麼算的？", a1: "兌換金額 = 金額 × 匯率 ×（1 − 手續費率）。例如 100 美元、匯率 31.5、手續費 0.5%，兌換金額約 3,134 台幣。",
    q2: "反向匯率是什麼？", a2: "反向匯率 = 1 ÷ 匯率，代表 1 單位目標幣別等於多少來源幣別。若 1 USD = 31.5 TWD，則 1 TWD ≈ 0.0317 USD。",
    q3: "匯率要去哪裡查？", a3: "可參考銀行牌告、財經網站或匯款商即時報價；中間市場匯率是基準，但實際換匯會加上買賣價差與手續費，填入您查到的實際匯率最準。",
    q4: "為什麼銀行換的比試算少？", a4: "銀行會在中間市場匯率上加買賣價差（通常 1%–3%）並收手續費，且現鈔匯率通常比電匯差，因此實際到手會低於以中間匯率試算的金額。",
    q5: "刷卡和換現鈔哪個划算？", a5: "視情況。刷卡多用接近中間市場的匯率但可能收國外交易手續費；換現鈔有現鈔價差。小額多用刷卡、需要現金時再換鈔通常較有利。",
    q6: "這個工具是即時匯率嗎？", a6: "不是。它以您輸入的匯率計算，方便快速試算；如需即時匯率，請以交易當下的銀行或匯款商報價為準。",
  },
  en: {
    badge: "Finance · FX conversion · Rate tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Currency Exchange Rate", subtitle: "Convert between two currencies and see the reverse rate",
    intro: "This tool converts between two currencies from your amount, source currency, and target rate \\u2014 showing the converted amount and reverse rate, with an optional fee \\u2014 to help you judge whether an exchange is worthwhile for travel, cross-border shopping, and remittance.",
    trustNoteLabel: "Note:", trustNote: "This tool uses the rate you enter. Real rates move in real time, and banks/transfer services add buy/sell spreads and fees \\u2014 rely on the live quote at the time of your trade.",
    quickActionCard: "Quick example", tryExample: "Build an FX example", examplePreview: "Converted amount preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the euro example",
    examplesCalculator: "Examples \\u2192 Calculator", enterValues: "Enter the amount and rate", examplesHelper: "Start from an example to understand FX conversion, then change your amount and the rate you looked up.",
    metric: "Forward FX", imperial: "Reverse FX", exampleCards: "Example cards", baselineExample: "100 USD · rate 31.5", activeExample: "Euro example", flowDemo: "USD \\u2192 TWD", calculator: "Calculator",
    weightValue: "Amount", purityValue: "Rate (1 source = ? target)", priceValue: "Fee (%)", unitHint: "Direction",
    resultCard: "FX conversion result", primaryValue: "Headline number",
    pureWeight: "Reverse rate", totalValue: "Converted amount", perGram: "Fee", grams: "target currency",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band FX amount matrix", tdeeMatrixNote: "L7 fixed six-band matrix \\u2014 places the converted amount into common FX ranges. This is an estimate, not a live quote.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the FX result into a clear reading", conversionNote: "L9 reflects your current results \\u2014 converted amount, reverse rate, and fee \\u2014 to help decide whether to exchange, which channel, or to wait for a better rate.",
    progressInsight: "Progress insight", possibleTarget: "Your current FX result", dailyGap: "Reverse rate", weeklyTrend: "Converted amount", motivation: "Motivation", keepMomentum: "Move from a one-off lookup to rate tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today\\u2019s FX result home", journeyHint: "Recalculate whenever the rate moves, the channel differs, or fees change \\u2014 and compare which option keeps the most.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Percentage Calculator to clarify the fee and rate-spread share", nextActionItem2: "Use Gold Silver Price Calculator to value metals in the target currency", nextActionItem3: "Use GST Calculator to extract a pre-tax base from tax-inclusive shopping",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Exchange \\u2192 Percentage \\u2192 Metals \\u2192 GST", bmrStep: "Exchange", deficitStep: "Percentage", trendStep: "Metals", mealStep: "GST",
    knowledge: "Knowledge", knowledgeTitle: "What FX conversion means in cross-border finance", definition: "Definition", definitionText: "FX conversion turns one currency into another at a given rate \\u2014 used for travel budgets, cross-border shopping, overseas remittance, and foreign-asset inventory.",
    formula: "Formula", formulaText: "Converted amount = amount \\u00d7 rate \\u00d7 (1 \\u2212 fee). Reverse rate = 1 \\u00f7 rate, showing how much source currency one unit of target currency equals.",
    limitations: "Limitations", limitationsText: "This tool uses a single rate you enter. It excludes buy/sell spreads, inter-bank fees, ATM overseas withdrawal fees, and real-time moves \\u2014 your actual amount may be lower.",
    interpretation: "Interpretation", interpretationText: "A higher rate means one unit of source currency buys more target currency; a higher fee means less in hand. Buy and sell rates differ, and cash vs card also differ.",
    context: "Context", contextText: "Read FX together with the channel (bank, airport, transfer service, card), timing, and fees \\u2014 the mid-market rate is the baseline; channel quotes usually deviate by a few percent.",
    example: "Example", exampleText: "100 USD, rate 1 USD = 31.5 TWD, fee 0.5%. Converted = 100 \\u00d7 31.5 \\u00d7 0.995 \\u2248 3,134 TWD; reverse rate \\u2248 0.0317 (1 TWD \\u2248 0.0317 USD).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for FX", premiumTitle: "Pro FX Conversion Toolkit", premiumText: "Unlock live-rate feeds, multi-currency batch conversion, channel fee tables, and rate-trend alert reports.",
    trustReferences: "Trust \\u00b7 Related tools \\u00b7 References", trust: "Trust", trustText: "This tool is for educational and estimation purposes only; the rate is whatever you enter, and it is not a substitute for a live quote or professional FX advice.", relatedTools: "Related tools", relatedToolsText: "Percentage Calculator \\u00b7 Gold Silver Price Calculator \\u00b7 Crypto Profit Calculator \\u00b7 GST Calculator", references: "References", referencesText: "The mid-market rate is the average of buy/sell; banks typically add 1%\\u20133%; the reverse rate is the reciprocal; airport and travel exchange points usually have wider spreads.",
    q1: "How is the converted amount calculated?", a1: "Converted amount = amount \\u00d7 rate \\u00d7 (1 \\u2212 fee). For 100 USD at rate 31.5 with a 0.5% fee, the converted amount is about 3,134 TWD.",
    q2: "What is the reverse rate?", a2: "Reverse rate = 1 \\u00f7 rate, showing how much source currency one unit of target equals. If 1 USD = 31.5 TWD, then 1 TWD \\u2248 0.0317 USD.",
    q3: "Where do I find the rate?", a3: "Check bank boards, finance sites, or a transfer service\\u2019s live quote. The mid-market rate is the baseline, but real exchanges add a spread and fee \\u2014 entering the actual rate you found is most accurate.",
    q4: "Why does the bank give less than the estimate?", a4: "Banks add a buy/sell spread (often 1%\\u20133%) on top of the mid-market rate and charge a fee, and cash rates are usually worse than wire \\u2014 so your real amount is below a mid-rate estimate.",
    q5: "Is card or cash better?", a5: "It depends. Cards often use a rate close to mid-market but may charge a foreign transaction fee; cash has a cash spread. Use cards for small spends and exchange cash only when you need physical money.",
    q6: "Is this a live exchange rate?", a6: "No. It uses the rate you enter for a quick estimate; for the live rate, rely on the bank or transfer service quote at the moment of your trade.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CurrencyExchangeRate() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=Forward, imperial=Reverse
  const [amountValue, setAmountValue] = useState("100");
  const [rateValue, setRateValue] = useState("31.5");
  const [feeValue, setFeeValue] = useState("0.5");
  const t = ui[lang];

  const result = useMemo(() => {
    const amount = Number(amountValue) || 0;
    const rate = Number(rateValue) || 0;
    const fee = (Number(feeValue) || 0) / 100;
    const effRate = unit === "imperial" ? (rate > 0 ? 1 / rate : 0) : rate;
    const converted = amount * effRate * (1 - fee);
    const reverseRate = rate > 0 ? 1 / rate : 0;
    return { converted, reverseRate, effRate };
  }, [amountValue, rateValue, feeValue, unit]);

  const convertedDisplay = fmt(result.converted, 2);
  const reverseDisplay = fmt(result.reverseRate, 4);

  function fillSolid() { setUnit("metric"); setAmountValue("100"); setRateValue("31.5"); setFeeValue("0.5"); }
  function fillEuro() { setUnit("metric"); setAmountValue("100"); setRateValue("1.08"); setFeeValue("0.5"); }

  const activeBand = bands.find(b => {
    const r = result.converted;
    if (r < 100) return b.key === "micro";
    if (r < 1000) return b.key === "small";
    if (r < 10000) return b.key === "mid";
    if (r < 100000) return b.key === "large";
    if (r < 1000000) return b.key === "major";
    return b.key === "corp";
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
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{convertedDisplay}</div><div className="text-sm font-bold text-indigo-100">{amountValue} · {rateValue}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.totalValue}</div><div className="font-black">{convertedDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.pureWeight}</div><div className="font-black">{reverseDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.perGram}</div><div className="font-black">{feeValue}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillEuro} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">USD\u2192TWD</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "100 美元 · 0.5%" : "100 USD · 0.5%"}</p></button><button onClick={fillEuro} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">USD\u2192EUR</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "100 · 匯率 1.08" : "100 · rate 1.08"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weightValue}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={amountValue} onChange={(e) => setAmountValue(e.target.value)} /></label><label className="block text-sm font-black text-indigo-700">{t.purityValue}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-lg font-bold" value={rateValue} onChange={(e) => setRateValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.priceValue}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feeValue} onChange={(e) => setFeeValue(e.target.value)} /></label><div><div className="text-sm font-black text-slate-700">{t.unitHint}</div><div className="mt-2 grid grid-cols-2 gap-2"><button className={`rounded-xl px-2 py-3 text-xs font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-2 py-3 text-xs font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{convertedDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.totalValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.pureWeight}</div><div className="mt-1 text-xl font-black">{reverseDisplay}</div><div className="mt-1 text-xs text-slate-300">1/{rateValue}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.totalValue}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "兌換" : "Converted"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{convertedDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.grams}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.pureWeight}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "反向" : "Reverse"}</div><p className="mt-2 text-3xl font-black text-blue-950">{reverseDisplay}</p><p className="text-sm font-bold text-blue-700">1/{rateValue}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.perGram}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "費率" : "Fee"}</div><p className="mt-2 text-3xl font-black text-slate-950">{feeValue}%</p><p className="text-sm font-bold text-slate-700">{rateValue}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="currency-exchange-rate-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{convertedDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.pureWeight}</div><div className="mt-1 text-3xl font-black text-indigo-950">{reverseDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.perGram}</div><div className="mt-1 text-3xl font-black text-emerald-950">{feeValue}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "匯率" : "Exchange", note: t.bmrStep }, { label: lang === "zh" ? "百分比" : "Percent", note: t.deficitStep }, { label: lang === "zh" ? "金銀" : "Metals", note: t.trendStep }, { label: lang === "zh" ? "GST" : "GST", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="currency-exchange-rate-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["即時匯率", "批次", "費率表", "走勢"] : ["Live", "Batch", "Fees", "Trends"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
