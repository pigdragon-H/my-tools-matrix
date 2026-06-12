// @profile B
// Profile B · 計算機-Finance · CryptoProfit 計算機（GOLD-STANDARD-001 compatible）

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
  { key: "deep", range: "<-30%", label: { zh: "深度虧損", en: "Deep loss" }, desc: { zh: "報酬率低於 -30%，已是重大虧損，建議檢視進場理由與停損紀律。", en: "ROI below -30% \\u2014 a major loss; review your entry thesis and stop-loss discipline." } },
  { key: "loss", range: "-30%~0%", label: { zh: "帳面虧損", en: "Paper loss" }, desc: { zh: "目前仍為負報酬，扣除手續費後尚未回本。", en: "Still a negative return \\u2014 not yet break-even after fees." } },
  { key: "flat", range: "0%~10%", label: { zh: "小幅獲利", en: "Small gain" }, desc: { zh: "小幅獲利，需留意手續費與滑價是否吃掉利潤。", en: "A small gain \\u2014 watch whether fees and slippage eat the profit." } },
  { key: "good", range: "10%~50%", label: { zh: "穩健獲利", en: "Solid gain" }, desc: { zh: "穩健報酬，可考慮分批獲利了結或設移動停利。", en: "A solid return \\u2014 consider scaling out or a trailing take-profit." } },
  { key: "high", range: "50%~200%", label: { zh: "高額獲利", en: "High gain" }, desc: { zh: "高額報酬，波動同樣偏大，建議鎖定部分本金。", en: "A high return \\u2014 volatility is large too; lock in part of the principal." } },
  { key: "moon", range: ">200%", label: { zh: "倍數獲利", en: "Multi-x gain" }, desc: { zh: "倍數報酬，務必留意稅務申報與獲利保全。", en: "A multi-x return \\u2014 mind tax reporting and protecting gains." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "即時匯率查詢器", en: "Currency Exchange Rate" }, href: "/tools/finance/currency-exchange-rate" },
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/finance/percentage-calculator" },
  { label: { zh: "金銀價格計算機", en: "Gold Silver Price Calculator" }, href: "/tools/finance/gold-silver-price-calculator" },
  { label: { zh: "GST 多國稅率計算機", en: "GST Calculator" }, href: "/tools/finance/gst-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 加密交易 · 獲利工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Crypto Profit Calculator · 加密貨幣獲利計算機", subtitle: "依買入價、賣出價與手續費算出真實獲利與報酬率",
    intro: "本工具依輸入的買入價、賣出價、持有數量與買賣手續費，立即算出加密貨幣的實際獲利、報酬率與盈虧金額，扣除雙邊手續費後得出淨利，協助評估每筆交易的真實收益與回本門檻。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅做獲利試算；不含資金費率、滑價、提領手續費、匯率換算或稅務，實際交易結果請以交易所成交紀錄為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立交易範例", examplePreview: "獲利預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入虧損範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入買入價、賣出價與數量", examplesHelper: "先用範例理解獲利試算，再改成自己的進出場價與部位大小。",
    metric: "做多", imperial: "回測", exampleCards: "範例卡", baselineExample: "BTC · 買 30k 賣 36k", activeExample: "虧損範例", flowDemo: "20% ROI", calculator: "計算機",
    weightValue: "買入價（每枚）", purityValue: "賣出價（每枚）", priceValue: "持有數量", unitHint: "手續費 (%)",
    resultCard: "獲利試算結果", primaryValue: "主要數值",
    pureWeight: "報酬率", totalValue: "淨獲利", perGram: "投入成本", grams: "%",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格報酬率區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將本筆報酬率放進常見績效區間；這是試算參考，不是投資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把獲利試算轉成可行判讀", conversionNote: "L9 會連動目前計算結果，顯示淨獲利、報酬率與投入成本，協助判斷是否該獲利了結、加碼或停損。",
    progressInsight: "進度洞察卡", possibleTarget: "目前交易績效", dailyGap: "報酬率", weeklyTrend: "淨獲利", motivation: "動力卡", keepMomentum: "從單筆獲利走向系統化交易",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的交易績效帶回家", journeyHint: "每次價格變動、部位調整或手續費不同時重新計算，追蹤交易是否符合預期報酬。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用即時匯率查詢器把獲利換成本地幣別", nextActionItem2: "用百分比計算機把報酬率拆成本金占比", nextActionItem3: "用 GST 計算機把含稅費用拆出不含稅基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "加密 → 匯率 → 百分比 → GST", bmrStep: "加密", deficitStep: "匯率", trendStep: "百分比", mealStep: "GST",
    knowledge: "知識", knowledgeTitle: "獲利試算在加密交易中的意義", definition: "定義", definitionText: "加密獲利試算是把「（賣出價 − 買入價）× 數量 − 手續費」算成淨利與報酬率，用於評估單筆交易、回測策略與資產盤點。",
    formula: "公式", formulaText: "投入成本 = 買入價 × 數量 ×（1 + 買入手續費率）。賣出所得 = 賣出價 × 數量 ×（1 − 賣出手續費率）。淨獲利 = 賣出所得 − 投入成本，報酬率 = 淨獲利 ÷ 投入成本 × 100%。",
    limitations: "限制", limitationsText: "本工具只做價差獲利試算；不含資金費率、槓桿利息、滑價、提領手續費、匯率與稅務，實際淨利可能因這些成本而降低。",
    interpretation: "解讀", interpretationText: "報酬率為正代表扣除手續費後仍獲利；為負代表尚未回本。手續費率越高、進出越頻繁，回本所需的價差就越大。",
    context: "脈絡", contextText: "獲利應搭配持有時間、稅務級距與整體部位配置一起看；單筆高報酬不代表策略長期穩定，建議記錄勝率與盈虧比。",
    example: "範例", exampleText: "買入 BTC 1 枚 @ $30,000、賣出 @ $36,000、手續費 0.1%。投入成本約 $30,030，賣出所得約 $35,964，淨獲利約 $5,934，報酬率約 19.8%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "獲利試算的下一步工具", premiumTitle: "專業版加密交易工具包", premiumText: "解鎖多交易所手續費對照、稅務級距試算、勝率盈虧比追蹤與投資組合報酬報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與試算用途，不取代專業財務或稅務建議，加密貨幣投資具高度風險。", relatedTools: "相關工具", relatedToolsText: "即時匯率查詢器 · 百分比計算機 · 金銀價格計算機 · GST 多國稅率計算機", references: "參考資料", referencesText: "報酬率（ROI）= 淨利 ÷ 成本；多數現貨交易所手續費約 0.1%–0.2%；含掛單/吃單費率差異；稅務申報依各國資本利得規定。",
    q1: "報酬率是怎麼算的？", a1: "報酬率 = 淨獲利 ÷ 投入成本 × 100%。淨獲利已扣除買賣雙邊手續費，因此即使賣價高於買價，手續費也可能讓報酬率變小或轉負。",
    q2: "手續費要怎麼填？", a2: "填入單邊百分比（例如 0.1 代表 0.1%）。本工具會在買入時加上手續費、賣出時扣除手續費，等於對買賣雙邊各收一次費用。",
    q3: "為什麼賣價比買價高卻沒賺？", a3: "若價差小於買賣雙邊手續費總和，扣費後就會虧損。例如手續費 0.2%×2，需價差超過約 0.4% 才能回本。",
    q4: "可以算做空或槓桿嗎？", a4: "本工具以現貨多單（買低賣高）為主；做空與槓桿涉及資金費率、利息與強平機制，需專用工具，這裡不納入計算。",
    q5: "幣別會影響結果嗎？", a5: "工具以同一計價幣別計算淨利金額；若要換成本地貨幣，可把淨獲利接到即時匯率查詢器再換算。",
    q6: "獲利需要報稅嗎？", a6: "多數國家把加密獲利視為資本利得或財產交易所得，需依當地規定申報；本工具不計算稅額，請諮詢稅務專業。",
  },
  en: {
    badge: "Finance · Crypto trading · Profit tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Crypto Profit Calculator", subtitle: "Find real profit and ROI from buy price, sell price, and fees",
    intro: "This tool computes your crypto profit, ROI, and gain/loss from the buy price, sell price, quantity, and trading fees \\u2014 deducting fees on both sides for a net profit \\u2014 to evaluate the true return and break-even of each trade.",
    trustNoteLabel: "Note:", trustNote: "This tool is a profit estimate only. It excludes funding rates, slippage, withdrawal fees, FX, and taxes \\u2014 rely on your exchange fill history for actual results.",
    quickActionCard: "Quick example", tryExample: "Build a trade example", examplePreview: "Profit preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the loss example",
    examplesCalculator: "Examples \\u2192 Calculator", enterValues: "Enter buy price, sell price, and quantity", examplesHelper: "Start from an example to understand profit estimation, then change your entry/exit prices and position size.",
    metric: "Long", imperial: "Backtest", exampleCards: "Example cards", baselineExample: "BTC · buy 30k sell 36k", activeExample: "Loss example", flowDemo: "20% ROI", calculator: "Calculator",
    weightValue: "Buy price (per coin)", purityValue: "Sell price (per coin)", priceValue: "Quantity", unitHint: "Fee (%)",
    resultCard: "Profit estimate result", primaryValue: "Headline number",
    pureWeight: "ROI", totalValue: "Net profit", perGram: "Cost basis", grams: "%",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band ROI matrix", tdeeMatrixNote: "L7 fixed six-band matrix \\u2014 places this ROI into common performance ranges. This is an estimate, not investment advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the profit estimate into a clear reading", conversionNote: "L9 reflects your current results \\u2014 net profit, ROI, and cost basis \\u2014 to help decide whether to take profit, add, or stop out.",
    progressInsight: "Progress insight", possibleTarget: "Your current trade performance", dailyGap: "ROI", weeklyTrend: "Net profit", motivation: "Motivation", keepMomentum: "Move from a single trade to systematic trading",
    saveShareJourney: "Save / share", journeyTitle: "Take today\\u2019s trade performance home", journeyHint: "Recalculate whenever the price moves, the position changes, or fees differ \\u2014 and track whether trades match your expected return.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Currency Exchange Rate to convert profit into a local currency", nextActionItem2: "Use Percentage Calculator to express ROI as a share of principal", nextActionItem3: "Use GST Calculator to extract a pre-tax base from a tax-inclusive fee",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Crypto \\u2192 Exchange \\u2192 Percentage \\u2192 GST", bmrStep: "Crypto", deficitStep: "Exchange", trendStep: "Percentage", mealStep: "GST",
    knowledge: "Knowledge", knowledgeTitle: "What profit estimation means in crypto trading", definition: "Definition", definitionText: "Crypto profit estimation turns \\u201c(sell \\u2212 buy) \\u00d7 quantity \\u2212 fees\\u201d into net profit and ROI \\u2014 used to evaluate single trades, backtest strategies, and inventory assets.",
    formula: "Formula", formulaText: "Cost basis = buy price \\u00d7 quantity \\u00d7 (1 + buy fee). Proceeds = sell price \\u00d7 quantity \\u00d7 (1 \\u2212 sell fee). Net profit = proceeds \\u2212 cost basis; ROI = net profit \\u00f7 cost basis \\u00d7 100%.",
    limitations: "Limitations", limitationsText: "This tool estimates price-spread profit only. It excludes funding rates, leverage interest, slippage, withdrawal fees, FX, and taxes \\u2014 your real net may be lower.",
    interpretation: "Interpretation", interpretationText: "A positive ROI means you profit after fees; negative means not yet break-even. Higher fees and more frequent trades require a larger spread to break even.",
    context: "Context", contextText: "Read profit together with holding period, tax bracket, and overall position sizing \\u2014 one high-ROI trade does not prove a stable strategy; log your win rate and reward/risk.",
    example: "Example", exampleText: "Buy 1 BTC @ $30,000, sell @ $36,000, fee 0.1%. Cost basis \\u2248 $30,030, proceeds \\u2248 $35,964, net profit \\u2248 $5,934, ROI \\u2248 19.8%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for profit estimation", premiumTitle: "Pro Crypto Trading Toolkit", premiumText: "Unlock multi-exchange fee tables, tax-bracket estimation, win-rate / reward-risk tracking, and portfolio return reports.",
    trustReferences: "Trust \\u00b7 Related tools \\u00b7 References", trust: "Trust", trustText: "This tool is for educational and estimation purposes only, is not a substitute for professional financial or tax advice, and crypto investing carries high risk.", relatedTools: "Related tools", relatedToolsText: "Currency Exchange Rate \\u00b7 Percentage Calculator \\u00b7 Gold Silver Price Calculator \\u00b7 GST Calculator", references: "References", referencesText: "ROI = net profit \\u00f7 cost; most spot exchange fees are about 0.1%\\u20130.2%; maker/taker rates differ; tax reporting follows each jurisdiction\\u2019s capital-gains rules.",
    q1: "How is ROI calculated?", a1: "ROI = net profit \\u00f7 cost basis \\u00d7 100%. Net profit already deducts buy and sell fees, so even with a higher sell price, fees can shrink ROI or turn it negative.",
    q2: "How do I fill in the fee?", a2: "Enter the one-side percentage (e.g., 0.1 means 0.1%). The tool adds the fee on the buy side and deducts it on the sell side \\u2014 effectively charging once per side.",
    q3: "Why no gain even though sell > buy?", a3: "If the spread is smaller than the combined buy+sell fees, you lose after fees. With a 0.2% fee on each side, you need a spread above about 0.4% to break even.",
    q4: "Can it handle shorts or leverage?", a4: "This tool focuses on spot longs (buy low, sell high). Shorts and leverage involve funding rates, interest, and liquidation \\u2014 they need a dedicated tool and are not included here.",
    q5: "Does currency affect the result?", a5: "The tool computes net profit in the same quote currency; to convert into your local currency, carry the net profit to the Currency Exchange Rate tool.",
    q6: "Do I owe tax on profit?", a6: "Most countries treat crypto gains as capital gains or property income that must be reported per local rules. This tool does not compute tax \\u2014 consult a tax professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CryptoProfitCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=Long, imperial=Backtest
  const [buyPrice, setBuyPrice] = useState("30000");
  const [sellPrice, setSellPrice] = useState("36000");
  const [quantity, setQuantity] = useState("1");
  const [feePct, setFeePct] = useState("0.1");
  const t = ui[lang];

  const result = useMemo(() => {
    const buy = Number(buyPrice) || 0;
    const sell = Number(sellPrice) || 0;
    const qty = Number(quantity) || 0;
    const fee = (Number(feePct) || 0) / 100;
    const cost = buy * qty * (1 + fee);
    const proceeds = sell * qty * (1 - fee);
    const netProfit = proceeds - cost;
    const roi = cost > 0 ? (netProfit / cost) * 100 : 0;
    return { cost, proceeds, netProfit, roi };
  }, [buyPrice, sellPrice, quantity, feePct]);

  const profitDisplay = fmt(result.netProfit, 0);
  const roiDisplay = fmt(result.roi, 1);
  const costDisplay = fmt(result.cost, 0);

  function fillSolid() { setUnit("metric"); setBuyPrice("30000"); setSellPrice("36000"); setQuantity("1"); setFeePct("0.1"); }
  function fillLoss() { setUnit("imperial"); setBuyPrice("40000"); setSellPrice("32000"); setQuantity("0.5"); setFeePct("0.2"); }

  const activeBand = bands.find(b => {
    const r = result.roi;
    if (r < -30) return b.key === "deep";
    if (r < 0) return b.key === "loss";
    if (r < 10) return b.key === "flat";
    if (r < 50) return b.key === "good";
    if (r < 200) return b.key === "high";
    return b.key === "moon";
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
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${profitDisplay}</div><div className="text-sm font-bold text-indigo-100">{roiDisplay}% ROI · {quantity}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.totalValue}</div><div className="font-black">${profitDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.pureWeight}</div><div className="font-black">{roiDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.perGram}</div><div className="font-black">${costDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillLoss} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">+20%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "1 枚 · 手續費 0.1%" : "1 coin · fee 0.1%"}</p></button><button onClick={fillLoss} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">-20%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "0.5 枚 · 手續費 0.2%" : "0.5 coin · fee 0.2%"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weightValue}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} /></label><label className="block text-sm font-black text-indigo-700">{t.purityValue}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-lg font-bold" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.priceValue}<input type="number" step="0.0001" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.unitHint}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feePct} onChange={(e) => setFeePct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${profitDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.totalValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.pureWeight}</div><div className="mt-1 text-xl font-black">{roiDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.grams}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.pureWeight}</div><div className="mt-1 text-xs font-black text-emerald-700">ROI</div><p className="mt-2 text-3xl font-black text-emerald-950">{roiDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.grams}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.perGram}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "成本" : "Cost"}</div><p className="mt-2 text-3xl font-black text-blue-950">${costDisplay}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "投入" : "in"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.totalValue}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "淨利" : "Net"}</div><p className="mt-2 text-3xl font-black text-slate-950">${profitDisplay}</p><p className="text-sm font-bold text-slate-700">{feePct}%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="crypto-profit-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">${profitDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.pureWeight}</div><div className="mt-1 text-3xl font-black text-indigo-950">{roiDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.perGram}</div><div className="mt-1 text-3xl font-black text-emerald-950">${costDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "加密" : "Crypto", note: t.bmrStep }, { label: lang === "zh" ? "匯率" : "Exchange", note: t.deficitStep }, { label: lang === "zh" ? "百分比" : "Percent", note: t.trendStep }, { label: lang === "zh" ? "GST" : "GST", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="crypto-profit-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["費率表", "稅務", "勝率", "報告"] : ["Fees", "Tax", "Win-rate", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
