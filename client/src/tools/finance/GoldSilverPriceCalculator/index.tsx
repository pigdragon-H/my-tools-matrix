// @profile B
// Profile B · 計算機-Finance · GoldSilverPrice 計算機（GOLD-STANDARD-001 compatible）

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

// 單位換算成公克
const GRAMS_PER_OZT = 31.1035; // 金衡盎司
const GRAMS_PER_TAEL = 37.5;   // 台錢一兩（台制）

const bands = [
  { key: "tiny", range: "<$500", label: { zh: "小額", en: "Small" }, desc: { zh: "小額貴金屬持有，常見於飾品或小型金條銀幣。", en: "Small precious-metal holding \u2014 typical for jewelry or small bars/coins." } },
  { key: "low", range: "$500–2k", label: { zh: "一般", en: "Modest" }, desc: { zh: "一般持有量，常見於婚嫁金飾或入門收藏。", en: "A modest holding \u2014 common for wedding jewelry or entry collections." } },
  { key: "mid", range: "$2k–10k", label: { zh: "中等", en: "Moderate" }, desc: { zh: "中等持有量，建議留意純度與買賣價差。", en: "A moderate holding \u2014 watch purity and the buy/sell spread." } },
  { key: "high", range: "$10k–50k", label: { zh: "高額", en: "High" }, desc: { zh: "高額持有，價格波動影響大，建議分散與保管。", en: "A high holding \u2014 price swings matter; consider diversification and storage." } },
  { key: "major", range: "$50k–200k", label: { zh: "重大", en: "Major" }, desc: { zh: "重大資產，建議搭配資產配置與保險。", en: "A major asset \u2014 pair with asset allocation and insurance." } },
  { key: "vault", range: ">$200k", label: { zh: "金庫級", en: "Vault-level" }, desc: { zh: "金庫級資產，須專業保管、認證與稅務規劃。", en: "Vault-level asset \u2014 requires professional custody, certification, and tax planning." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "即時匯率查詢器", en: "Currency Exchange Rate" }, href: "/tools/finance/currency-exchange-rate" },
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/finance/percentage-calculator" },
  { label: { zh: "加密貨幣獲利計算機", en: "Crypto Profit Calculator" }, href: "/tools/finance/crypto-profit-calculator" },
  { label: { zh: "GST 多國稅率計算機", en: "GST Calculator" }, href: "/tools/finance/gst-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 貴金屬估值 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Gold Silver Price Calculator · 金銀價格計算機", subtitle: "依重量、純度與單價算出貴金屬實際價值",
    intro: "本工具依輸入的金銀重量、純度（K 金或千分比）與每公克單價，立即算出純金屬重量與實際價值，支援盎司、公克與台錢單位換算，協助估算金飾、金條與銀幣的真實含金/含銀價值。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅做含金/含銀價值估算；不含工錢、品牌溢價、買賣價差、稅金或鑑定費，實際交易價格請以當地金行報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立金價範例", examplePreview: "貴金屬價值預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入銀幣範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入重量、純度與單價", examplesHelper: "先用範例理解貴金屬估值，再改成自己的重量與當日金價。",
    metric: "黃金", imperial: "白銀", exampleCards: "範例卡", baselineExample: "黃金 · 1 盎司 · 24K", activeExample: "白銀範例", flowDemo: "31.1g · 99.9%", calculator: "計算機",
    weightValue: "重量", purityValue: "純度 (%)", priceValue: "單價（$/公克）", unitHint: "重量單位",
    resultCard: "貴金屬估值結果", primaryValue: "主要數值",
    pureWeight: "純金屬重量", totalValue: "實際價值", perGram: "每公克", grams: "公克",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格貴金屬價值區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將貴金屬價值放進常見持有區間；這是估值參考，不是投資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把貴金屬估值轉成可行判讀", conversionNote: "L9 會連動目前計算結果，顯示純金屬重量、實際價值與每公克單價，協助判斷飾品是否含工錢溢價、收購是否合理。",
    progressInsight: "進度洞察卡", possibleTarget: "目前貴金屬估值", dailyGap: "純金屬重量", weeklyTrend: "實際價值", motivation: "動力卡", keepMomentum: "從單次估值走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的金銀估值帶回家", journeyHint: "每次金價變動、純度不同或重量調整時重新計算，追蹤貴金屬價值是否符合金行報價。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用即時匯率查詢器把貴金屬價值換成目標幣別", nextActionItem2: "用百分比計算機把工錢或溢價算成占比", nextActionItem3: "用 GST 計算機把含稅收購價拆出不含稅基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "金銀 → 匯率 → 百分比 → GST", bmrStep: "金銀", deficitStep: "匯率", trendStep: "百分比", mealStep: "GST",
    knowledge: "知識", knowledgeTitle: "貴金屬估值在財務換算中的意義", definition: "定義", definitionText: "貴金屬估值是把金銀的「重量 × 純度 × 單價」換算成實際含金/含銀價值，常用於金飾收購、金條銀幣交易與資產盤點。",
    formula: "公式", formulaText: "純金屬重量（公克）= 重量（換算成公克）× 純度 ÷ 100。實際價值 = 純金屬重量 × 每公克單價。盎司換公克 ×31.1035，台錢（一兩）×37.5。",
    limitations: "限制", limitationsText: "本工具只估含金/含銀價值；不含工錢、品牌溢價、鑲嵌寶石、買賣價差、稅金或鑑定費，飾品實際收購常低於純金屬價值。",
    interpretation: "解讀", interpretationText: "金飾標示重量含寶石與配件，純金屬重量需扣除；24K 約 99.9% 純度、18K 約 75%、14K 約 58.5%，純度越低同重量價值越低。",
    context: "脈絡", contextText: "貴金屬價值應搭配當日金價、純度標示與單位（盎司/公克/台錢）一起看；不同金行買入賣出價差可能達數個百分點。",
    example: "範例", exampleText: "黃金 1 盎司（31.1035 公克）、純度 99.9%、單價 $60/公克。純金屬重量 = 31.1035 × 0.999 ≈ 31.07 公克，實際價值 ≈ 31.07 × 60 = $1,864。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "貴金屬估值的下一步工具", premiumTitle: "專業版貴金屬工具包", premiumText: "解鎖即時金銀價串接、多幣別估值、工錢溢價拆解與資產盤點報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與估值用途，不取代專業鑑定或投資建議。", relatedTools: "相關工具", relatedToolsText: "即時匯率查詢器 · 百分比計算機 · 加密貨幣獲利計算機 · GST 多國稅率計算機", references: "參考資料", referencesText: "倫敦金銀市場協會 LBMA 定盤價；金衡盎司換算標準（1 ozt = 31.1035g）；台制一兩 = 37.5g；K 金純度對照（24K≈99.9%、18K=75%）。",
    q1: "金飾標示重量就是純金重量嗎？", a1: "不是。標示重量是總重，含寶石、配件與焊料；純金屬重量需用總重乘以純度。18K 金 10 公克的純金重量約 7.5 公克。",
    q2: "K 金純度怎麼換算？", a2: "24K≈99.9%、22K≈91.6%、18K=75%、14K≈58.5%、10K≈41.7%。把 K 數除以 24 即得約略純度比例，再乘上重量得純金屬重量。",
    q3: "盎司、公克、台錢怎麼換算？", a3: "金銀用金衡盎司，1 盎司 = 31.1035 公克；台制一兩 = 37.5 公克（一錢 = 3.75 公克）。本工具會自動把選定單位換算成公克再估值。",
    q4: "為什麼金行收購價比估值低？", a4: "金行收購會扣除買賣價差、提煉成本與利潤；飾品還會扣工錢與品牌溢價，因此實際收購價通常低於純金屬價值。",
    q5: "白銀也能用這個工具算嗎？", a5: "可以。切換到白銀並輸入白銀純度（純銀約 99.9%、925 銀為 92.5%）與每公克銀價即可，計算邏輯與黃金相同。",
    q6: "這個工具能取代鑑定嗎？", a6: "不能。它只做價值換算；純度與真偽需由專業鑑定或試金確認，貴重交易建議附鑑定證書。",
  },
  en: {
    badge: "Finance · Precious metals · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Gold Silver Price Calculator", subtitle: "Find the real metal value from weight, purity, and price",
    intro: "This tool computes the pure-metal weight and real value from your gold/silver weight, purity (karat or per-mille), and price per gram \u2014 with ounce, gram, and tael unit conversion \u2014 to estimate the true gold/silver value of jewelry, bars, and coins.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates pure gold/silver value only. It excludes craftsmanship, brand premium, buy/sell spread, taxes, and appraisal fees \u2014 rely on local dealer quotes for actual trade prices.",
    quickActionCard: "Quick example", tryExample: "Build a metal-price example", examplePreview: "Metal value preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the silver example",
    examplesCalculator: "Examples \u2192 Calculator", enterValues: "Enter weight, purity, and price", examplesHelper: "Start from an example to understand metal valuation, then change the weight and today\u2019s price.",
    metric: "Gold", imperial: "Silver", exampleCards: "Example cards", baselineExample: "Gold \u00b7 1 oz \u00b7 24K", activeExample: "Silver example", flowDemo: "31.1g \u00b7 99.9%", calculator: "Calculator",
    weightValue: "Weight", purityValue: "Purity (%)", priceValue: "Price ($/gram)", unitHint: "Weight unit",
    resultCard: "Metal valuation result", primaryValue: "Headline number",
    pureWeight: "Pure-metal weight", totalValue: "Real value", perGram: "Per gram", grams: "grams",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band metal value matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 places the metal value into common holding ranges. This is a valuation reference, not investment advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the metal valuation into a clear reading", conversionNote: "L9 reflects your current results \u2014 pure-metal weight, real value, and price per gram \u2014 to help judge jewelry craftsmanship premium and whether a buy-back is fair.",
    progressInsight: "Progress insight", possibleTarget: "Your current metal valuation", dailyGap: "Pure-metal weight", weeklyTrend: "Real value", motivation: "Motivation", keepMomentum: "Move from a one-off valuation to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today\u2019s metal valuation home", journeyHint: "Recalculate whenever the price moves, purity differs, or weight changes \u2014 and track whether the value matches dealer quotes.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Currency Exchange Rate to convert the metal value into a target currency", nextActionItem2: "Use Percentage Calculator to express craftsmanship or premium as a share", nextActionItem3: "Use GST Calculator to extract a pre-tax base from a tax-inclusive buy price",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Metals \u2192 Exchange \u2192 Percentage \u2192 GST", bmrStep: "Metals", deficitStep: "Exchange", trendStep: "Percentage", mealStep: "GST",
    knowledge: "Knowledge", knowledgeTitle: "What metal valuation means in financial conversion", definition: "Definition", definitionText: "Metal valuation converts gold/silver \u201cweight \u00d7 purity \u00d7 price\u201d into a real metal value \u2014 used for jewelry buy-backs, bar/coin trades, and asset inventory.",
    formula: "Formula", formulaText: "Pure-metal weight (g) = weight (in grams) \u00d7 purity \u00f7 100. Real value = pure-metal weight \u00d7 price per gram. Ounce to gram \u00d731.1035; tael \u00d737.5.",
    limitations: "Limitations", limitationsText: "This tool estimates pure gold/silver value only. It excludes craftsmanship, brand premium, set stones, buy/sell spread, taxes, and appraisal fees \u2014 jewelry buy-backs are often below pure-metal value.",
    interpretation: "Interpretation", interpretationText: "Jewelry weight includes stones and fittings, so deduct them for pure-metal weight. 24K \u2248 99.9% purity, 18K \u2248 75%, 14K \u2248 58.5%; lower purity means lower value for the same weight.",
    context: "Context", contextText: "Read metal value together with today\u2019s spot price, the purity mark, and the unit (oz/gram/tael) \u2014 different dealers\u2019 buy/sell spreads can reach several percent.",
    example: "Example", exampleText: "Gold 1 oz (31.1035 g), purity 99.9%, price $60/g. Pure-metal weight = 31.1035 \u00d7 0.999 \u2248 31.07 g, real value \u2248 31.07 \u00d7 60 = $1,864.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for metal valuation", premiumTitle: "Pro Precious-Metal Toolkit", premiumText: "Unlock live gold/silver feeds, multi-currency valuation, craftsmanship-premium breakdowns, and asset-inventory reports.",
    trustReferences: "Trust \u00b7 Related tools \u00b7 References", trust: "Trust", trustText: "This tool is for educational and valuation purposes only and is not a substitute for professional appraisal or investment advice.", relatedTools: "Related tools", relatedToolsText: "Currency Exchange Rate \u00b7 Percentage Calculator \u00b7 Crypto Profit Calculator \u00b7 GST Calculator", references: "References", referencesText: "LBMA gold/silver fix prices; troy-ounce standard (1 ozt = 31.1035g); Taiwanese tael = 37.5g; karat purity table (24K\u224899.9%, 18K=75%).",
    q1: "Is the marked jewelry weight the pure-gold weight?", a1: "No. The marked weight is total weight, including stones, fittings, and solder. Pure-metal weight is total weight \u00d7 purity. A 10g 18K piece has about 7.5g of pure gold.",
    q2: "How do I convert karat to purity?", a2: "24K\u224899.9%, 22K\u224891.6%, 18K=75%, 14K\u224858.5%, 10K\u224841.7%. Divide the karat by 24 for the approximate purity ratio, then multiply by weight for pure-metal weight.",
    q3: "How do ounces, grams, and taels convert?", a3: "Gold/silver use troy ounces: 1 oz = 31.1035 g; a Taiwanese tael = 37.5 g (one mace = 3.75 g). This tool auto-converts the selected unit to grams before valuing.",
    q4: "Why is the dealer buy price lower than the valuation?", a4: "Dealers deduct the buy/sell spread, refining cost, and profit; jewelry also loses craftsmanship and brand premium, so actual buy-back is usually below pure-metal value.",
    q5: "Can I value silver with this tool too?", a5: "Yes. Switch to silver and enter the silver purity (fine silver \u2248 99.9%, sterling is 92.5%) and the silver price per gram \u2014 the logic is the same as gold.",
    q6: "Can this tool replace an appraisal?", a6: "No. It only converts value. Purity and authenticity need professional appraisal or assay; for valuable trades, include a certificate.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function GoldSilverPriceCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=Gold, imperial=Silver
  const [weightValue, setWeightValue] = useState("1");
  const [weightUnit, setWeightUnit] = useState<"ozt" | "gram" | "tael">("ozt");
  const [purityValue, setPurityValue] = useState("99.9");
  const [priceValue, setPriceValue] = useState("60");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weightValue) || 0;
    const purity = Number(purityValue) || 0;
    const price = Number(priceValue) || 0;
    const grams = weightUnit === "ozt" ? w * GRAMS_PER_OZT : weightUnit === "tael" ? w * GRAMS_PER_TAEL : w;
    const pureGrams = grams * (purity / 100);
    const totalValue = pureGrams * price;
    return { grams, pureGrams, totalValue };
  }, [weightValue, weightUnit, purityValue, priceValue]);

  const valueDisplay = fmt(result.totalValue, 0);
  const pureDisplay = fmt(result.pureGrams, 2);

  function fillSolid() { setUnit("metric"); setWeightValue("1"); setWeightUnit("ozt"); setPurityValue("99.9"); setPriceValue("60"); }
  function fillSilver() { setUnit("imperial"); setWeightValue("100"); setWeightUnit("gram"); setPurityValue("92.5"); setPriceValue("0.8"); }

  const activeBand = bands.find(b => {
    const r = result.totalValue;
    if (r < 500) return b.key === "tiny";
    if (r < 2000) return b.key === "low";
    if (r < 10000) return b.key === "mid";
    if (r < 50000) return b.key === "high";
    if (r < 200000) return b.key === "major";
    return b.key === "vault";
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
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${valueDisplay}</div><div className="text-sm font-bold text-indigo-100">{weightValue} {weightUnit} · {purityValue}%</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.totalValue}</div><div className="font-black">${valueDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{pureDisplay}g</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.perGram}</div><div className="font-black">${priceValue}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillSilver} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">$1,864</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "1 盎司 · 99.9%" : "1 oz · 99.9%"}</p></button><button onClick={fillSilver} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">925</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "100g · 92.5%" : "100g · 92.5%"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weightValue}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} /></label><label className="block text-sm font-black text-indigo-700">{t.purityValue}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-lg font-bold" value={purityValue} onChange={(e) => setPurityValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.priceValue}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} /></label><div><div className="text-sm font-black text-slate-700">{t.unitHint}</div><div className="mt-2 grid grid-cols-3 gap-2">{(["ozt","gram","tael"] as const).map((u) => <button key={u} className={`rounded-xl px-2 py-3 text-xs font-black ${weightUnit === u ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setWeightUnit(u)}>{u === "ozt" ? (lang === "zh" ? "盎司" : "oz") : u === "gram" ? (lang === "zh" ? "公克" : "g") : (lang === "zh" ? "台錢" : "tael")}</button>)}</div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${valueDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.totalValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.pureWeight}</div><div className="mt-1 text-xl font-black">{pureDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.grams}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.pureWeight}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "純重" : "Pure"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{pureDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.grams}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.perGram}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "單價" : "Price"}</div><p className="mt-2 text-3xl font-black text-blue-950">${priceValue}</p><p className="text-sm font-bold text-blue-700">/g</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.totalValue}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "總值" : "Total"}</div><p className="mt-2 text-3xl font-black text-slate-950">${valueDisplay}</p><p className="text-sm font-bold text-slate-700">{purityValue}%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="gold-silver-price-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">${valueDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.pureWeight}</div><div className="mt-1 text-3xl font-black text-indigo-950">{pureDisplay}g</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.perGram}</div><div className="mt-1 text-3xl font-black text-emerald-950">${priceValue}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "金銀" : "Metals", note: t.bmrStep }, { label: lang === "zh" ? "匯率" : "Exchange", note: t.deficitStep }, { label: lang === "zh" ? "百分比" : "Percent", note: t.trendStep }, { label: lang === "zh" ? "GST" : "GST", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="gold-silver-price-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["即時價", "多幣別", "工錢", "報告"] : ["Live", "Multi-FX", "Premium", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
