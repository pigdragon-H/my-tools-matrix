// @profile B
// Profile B · 電商-工具 · EtsyFeeCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");
const pct = (v: number) => (isFinite(v) ? v.toFixed(1) : "0.0") + "%";

const LISTING_FEE = 0.2;
const TRANSACTION_RATE = 0.065;
const PAYMENT_RATE = 0.03;
const PAYMENT_FLAT = 0.25;

type AdTier = "none" | "low" | "high";
const OFFSITE_RATE: Record<string, number> = { none: 0, low: 0.12, high: 0.15 };

const bands = [
  { key: "listing", range: "$0.20", label: { zh: "刊登費", en: "Listing fee" }, desc: { zh: "Etsy 每件商品上架收取固定刊登費 $0.20,刊登有效期約四個月或售出為止,售出後需重新刊登。", en: "Etsy charges a flat $0.20 listing fee per item, valid for about four months or until sold, with relisting needed after a sale." } },
  { key: "transaction", range: "6.5%", label: { zh: "交易費", en: "Transaction" }, desc: { zh: "交易費以售價（含運費）的 6.5% 計算,是 Etsy 主要抽成,售出後自動扣除。", en: "The transaction fee is 6.5% of the sale price (including shipping), Etsy's main cut, deducted automatically after a sale." } },
  { key: "payment", range: "3%+$0.25", label: { zh: "支付處理費", en: "Payment" }, desc: { zh: "Etsy Payments 支付處理費約售價的 3% 加 $0.25 固定費,費率因國家而略有不同。", en: "Etsy Payments processing fee is about 3% of the sale plus a $0.25 flat fee, varying slightly by country." } },
  { key: "offsite", range: "12-15%", label: { zh: "站外廣告", en: "Offsite Ads" }, desc: { zh: "Offsite Ads 對由站外廣告帶來的訂單收 12%（高銷量賣家強制）或 15%（一般賣家可選）。", en: "Offsite Ads charges 12% (mandatory for high-volume sellers) or 15% (optional for others) on orders driven by external ads." } },
  { key: "net", range: "after fees", label: { zh: "淨收入", en: "Net income" }, desc: { zh: "淨收入 = 售價 − 刊登費 − 交易費 − 支付處理費 − 站外廣告 − 商品成本,是扣完所有費用後留下的金額。", en: "Net = price - listing - transaction - payment - offsite - product cost, the amount left after all fees." } },
  { key: "margin", range: "net/sale", label: { zh: "利潤率", en: "Margin" }, desc: { zh: "利潤率 = 淨收入 ÷ 售價;Etsy 小額商品費用占比高,薄利商品需特別留意是否仍有合理利潤。", en: "Margin = net / sale price; on Etsy fees take a high share of low-priced items, so check thin-margin items keep reasonable profit." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "亞馬遜FBA計算機", en: "Amazon FBA" }, href: "/tools/ecommerce/amazon-fba-calculator" },
  { label: { zh: "代發貨獲利計算機", en: "Dropshipping Profit" }, href: "/tools/ecommerce/dropshipping-profit-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost" }, href: "/tools/ecommerce/shipping-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · Etsy · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Etsy Fee Calculator · Etsy費用計算機", subtitle: "計算刊登費、交易費、支付處理費與站外廣告後的淨收入與利潤率",
    intro: "本工具把你輸入的售價,扣除 Etsy 刊登費（$0.20）、交易費（6.5%）、支付處理費（3% + $0.25）、站外廣告（12-15%,可選）與商品成本,即時算出淨收入與利潤率,協助你在上架與定價前看清每件商品扣完費用後實際留下多少。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以 Etsy 一般費率估算,屬定價參考;實際支付處理費率因國家而異,站外廣告費僅對由站外廣告帶來的訂單收取,正式數字請以 Etsy 賣家後台為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例售價即時計算", examplePreview: "淨收入", examplePerson: "利潤率", flowDemo: "總費用", fillExample: "載入範例 · 無站外", previewActivePath: "載入範例 · 含站外",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入售價、成本與站外廣告", examplesHelper: "先用範例了解 Etsy 費用結構,再輸入你自己的售價、商品成本與站外廣告選項,即可得到各項費用明細、淨收入與利潤率。",
    metric: "無站外", imperial: "含站外", exampleCards: "範例卡", baselineExample: "範例 · 無站外", activeExample: "範例 · 含站外", calculator: "計算器",
    modeLabel: "站外廣告", countLabel: "商品售價（USD）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "Etsy 費用結果", estimatedTdee: "淨收入", monthlyEquiv: "交易費", weeklyEquiv: "支付費", dailyEquiv: "利潤率", effectiveHours: "總費用", fatLossTarget: "成本",
    outputLabel: "Etsy 費用分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 Etsy 費用結構矩陣", tdeeMatrixNote: "L7 固定六格,列出 Etsy 各項費用與利潤指標;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把費用計算整合進上架與定價策略", conversionNote: "L9 會連動目前計算結果,顯示淨收入、利潤率與總費用,協助你判斷該商品的定價是否合理與是否值得開站外廣告。",
    progressInsight: "進度洞察卡", possibleTarget: "目前商品計算", dailyGap: "淨收入", weeklyTrend: "售價", motivation: "動力卡", keepMomentum: "從單件試算走向整店費用與定價管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次試算帶進你的商品清單", journeyHint: "每次更換商品、調整售價或站外廣告選項時重新計算,並把結果記錄到商品定價表或店鋪損益系統。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用定價計算機反推達成目標利潤率的售價", nextActionItem2: "用代發貨獲利計算機比較無庫存模式的利潤", nextActionItem3: "用運費計算機估算商品的真實物流成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸售價 → 扣Etsy費 → 扣成本 → 得淨收", bmrStep: "輸售價", deficitStep: "扣Etsy費", trendStep: "扣成本", mealStep: "得淨收",
    knowledge: "知識", knowledgeTitle: "Etsy 費用與淨收入的意義", definition: "定義", definitionText: "Etsy 是手作與復古商品平台,賣家上架需付刊登費,售出後付交易費與支付處理費,若由站外廣告成交還需付站外廣告費;淨收入是扣完所有費用與成本後留下的金額。",
    formula: "公式", formulaText: "淨收入 = 售價 − 刊登費 $0.20 − 交易費（售價×6.5%）− 支付處理費（售價×3% + $0.25）− 站外廣告（售價×12% 或 15%）− 商品成本;利潤率 = 淨收入 ÷ 售價。",
    limitations: "限制", limitationsText: "本工具以一般費率估算,屬定價參考;實際支付處理費率因國家而異,站外廣告僅對站外帶來的訂單收取且費率依資格不同,正式數字以 Etsy 賣家後台為準。",
    interpretation: "解讀", interpretationText: "利潤率高於 30% 為優、15-30% 健康、10-15% 偏低、低於 10% 風險高;Etsy 小額商品固定費占比高,薄利商品扣完費用後可能所剩無幾,需謹慎定價。",
    context: "脈絡", contextText: "了解 Etsy 費用可協助賣家在上架與定價前評估真實收入,避免售價過低扣完費用反而虧損,並決定是否值得參與站外廣告。",
    example: "範例", exampleText: "售價 $25、商品成本 $8、無站外廣告,刊登費 $0.20、交易費 $1.63、支付處理費 $1,淨收入約 $14.17,利潤率約 57%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "電商定價工作流程的下一步工具", premiumTitle: "專業版 Etsy 賣家工具包", premiumText: "解鎖多商品批次試算、各國支付費率表、站外廣告損益模擬與整店費用追蹤報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做 Etsy 費用與淨收入估算,屬定價參考;不構成投資建議,正式費用以 Etsy 賣家後台為準。", relatedTools: "相關工具", relatedToolsText: "亞馬遜FBA計算機 · 代發貨獲利計算機 · 定價計算機 · 運費計算機", references: "參考資料", referencesText: "Etsy 刊登費、交易費與支付處理費結構;Offsite Ads 費率與資格規則;電商利潤率與定價評估原則。",
    q1: "Etsy 主要有哪些費用？", a1: "主要有刊登費（$0.20/件）、交易費（售價含運費的 6.5%）與支付處理費（約 3% + $0.25）;若訂單由站外廣告帶來還需付 Offsite Ads 費（12% 或 15%）。",
    q2: "站外廣告費怎麼算？", a2: "Offsite Ads 只對由 Etsy 站外廣告帶來的訂單收費;高銷量賣家強制 12%,其他賣家可選 15%,自然流量或站內成交不收此費。",
    q3: "支付處理費為什麼有固定費？", a3: "Etsy Payments 採百分比加固定費（約 3% + $0.25）,固定費對小額商品占比相對較高,因此低單價商品的整體費用比例會比高單價商品更重。",
    q4: "為什麼每次結果不同？", a4: "售價、成本與站外廣告選項不同,結果自然不同;這很正常,建議依實際商品輸入精確數字,並考慮是否會由站外廣告成交,才能得到貼近真實的淨收入。",
    q5: "怎麼提高 Etsy 淨收入？", a5: "可從提高售價、降低商品成本、評估是否關閉非強制的站外廣告,或將多件商品組合銷售以分攤固定費著手;定價前先用本工具確認利潤率最有效。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有售價、成本與費用計算都在你的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "E-Commerce · Etsy · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Etsy Fee Calculator", subtitle: "Compute net income and margin after listing, transaction, payment, and offsite-ad fees",
    intro: "This tool takes the sale price you enter and subtracts the Etsy listing fee ($0.20), transaction fee (6.5%), payment processing fee (3% + $0.25), Offsite Ads (12-15%, optional), and product cost to instantly compute net income and margin, helping you see exactly how much each item keeps after fees before listing and pricing. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates with general Etsy rates and is a pricing reference; the actual payment processing rate varies by country, Offsite Ads only apply to orders driven by external ads \u2014 confirm in the Etsy seller dashboard. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample price and compute", examplePreview: "Net income", examplePerson: "Margin", flowDemo: "Total fees", fillExample: "Load sample · no offsite", previewActivePath: "Load sample · with offsite",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter price, cost, and offsite ads", examplesHelper: "Start with a sample to understand the Etsy fee structure, then enter your own sale price, product cost, and offsite-ad option to get a fee breakdown, net income, and margin.",
    metric: "No offsite", imperial: "With offsite", exampleCards: "Example cards", baselineExample: "Sample · no offsite", activeExample: "Sample · with offsite", calculator: "Calculator",
    modeLabel: "Offsite Ads", countLabel: "Sale price (USD)", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Etsy fee result", estimatedTdee: "Net income", monthlyEquiv: "Transaction", weeklyEquiv: "Payment", dailyEquiv: "Margin", effectiveHours: "Total fees", fatLossTarget: "Cost",
    outputLabel: "Etsy fee summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band Etsy fee-structure matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 lists Etsy fees and profit metrics. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit fee calculation into listing and pricing strategy", conversionNote: "L9 reflects your current calculation \u2014 net income, margin, and total fees \u2014 to help you decide whether the price is reasonable and whether offsite ads are worth it.",
    progressInsight: "Progress insight", possibleTarget: "Your current item calc", dailyGap: "Net income", weeklyTrend: "Sale price", motivation: "Motivation", keepMomentum: "Move from a single item to whole-shop fee and pricing management",
    saveShareJourney: "Save / share", journeyTitle: "Take this calc into your product list", journeyHint: "Recompute whenever you change the item, price, or offsite-ad option, and log the result into a pricing sheet or shop P&L system.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Pricing Calculator to back into a price for a target margin", nextActionItem2: "Use the Dropshipping Profit Calculator to compare a no-inventory model", nextActionItem3: "Use the Shipping Cost Calculator to estimate real logistics cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Price → Subtract Etsy fees → Subtract cost → Net", bmrStep: "Price", deficitStep: "Etsy fees", trendStep: "Cost", mealStep: "Net",
    knowledge: "Knowledge", knowledgeTitle: "What Etsy fees and net income mean", definition: "Definition", definitionText: "Etsy is a handmade and vintage marketplace; sellers pay a listing fee to list, transaction and payment fees on a sale, and offsite-ad fees if an order is driven by external ads; net income is what remains after all fees and costs.",
    formula: "Formula", formulaText: "Net = price - listing $0.20 - transaction (price x 6.5%) - payment (price x 3% + $0.25) - offsite (price x 12% or 15%) - product cost; margin = net / price.",
    limitations: "Limitations", limitationsText: "This tool estimates with general rates and is a pricing reference; the actual payment rate varies by country, Offsite Ads only apply to externally driven orders with rates by eligibility \u2014 the Etsy seller dashboard governs.",
    interpretation: "Interpretation", interpretationText: "A margin above 30% is great, 15-30% healthy, 10-15% low, below 10% risky; Etsy's flat fees take a high share of low-priced items, so thin-margin items may keep little after fees \u2014 price carefully.",
    context: "Context", contextText: "Knowing Etsy fees helps sellers assess true income before listing and pricing, avoiding underpricing that loses money after fees, and deciding whether offsite ads are worth joining.",
    example: "Example", exampleText: "Price $25, product cost $8, no offsite ads: listing $0.20, transaction $1.63, payment $1 gives ~$14.17 net income, ~57% margin.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for an e-commerce pricing workflow", premiumTitle: "Pro Etsy Seller Toolkit", premiumText: "Unlock multi-item batch calculation, per-country payment-rate tables, offsite-ad P&L simulation, and whole-shop fee-tracking reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only estimates Etsy fees and net income and is a pricing reference; it is not investment advice \u2014 actual fees follow the Etsy seller dashboard.", relatedTools: "Related tools", relatedToolsText: "Amazon FBA Calculator · Dropshipping Profit Calculator · Pricing Calculator · Shipping Cost Calculator", references: "References", referencesText: "Etsy listing, transaction, and payment fee structures; Offsite Ads rates and eligibility rules; e-commerce margin and pricing evaluation principles.",
    q1: "What are the main Etsy fees?", a1: "Mainly the listing fee ($0.20/item), transaction fee (6.5% of price including shipping), and payment processing fee (~3% + $0.25); if an order comes from offsite ads, an Offsite Ads fee (12% or 15%) also applies.",
    q2: "How are offsite-ad fees calculated?", a2: "Offsite Ads only charge on orders driven by Etsy's external ads; high-volume sellers pay a mandatory 12%, others can opt into 15%, while organic or on-site sales are not charged this fee.",
    q3: "Why does the payment fee have a flat fee?", a3: "Etsy Payments uses a percentage plus a flat fee (~3% + $0.25); the flat fee is relatively larger on low-priced items, so the overall fee share is heavier for cheap items than for expensive ones.",
    q4: "Why does each result differ?", a4: "Price, cost, and offsite-ad option differ, so results differ; this is normal \u2014 enter precise figures for the real item and consider whether it may sell via offsite ads to get a net income close to actual.",
    q5: "How do I raise Etsy net income?", a5: "Raise price, lower product cost, evaluate turning off optional offsite ads, or bundle items to spread the flat fee; confirming margin with this tool before pricing is most effective.",
    q6: "Does this tool upload my data?", a6: "No. All price, cost, and fee calculations run locally in your browser \u2014 the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function EtsyFeeCalculator() {
  const { lang, setLang } = useLanguage();
  const [tier, setTier] = useState<AdTier>("none");
  const [price, setPrice] = useState("25");
  const [cost, setCost] = useState("8");
  const t = ui[lang];

  const result = useMemo(() => {
    const p = Math.max(0, Number(price) || 0);
    const c = Math.max(0, Number(cost) || 0);
    const listing = LISTING_FEE;
    const transaction = p * TRANSACTION_RATE;
    const payment = p * PAYMENT_RATE + PAYMENT_FLAT;
    const offsite = p * OFFSITE_RATE[tier];
    const fees = listing + transaction + payment + offsite;
    const net = p - fees - c;
    const margin = p > 0 ? (net / p) * 100 : 0;
    return { net, listing, transaction, payment, offsite, fees, margin, cost: c };
  }, [tier, price, cost]);

  const verdict = useMemo<LocalText>(() => {
    if (result.margin >= 30) return { zh: "優異利潤 🚀", en: "Great margin 🚀" };
    if (result.margin >= 15) return { zh: "健康利潤 ✅", en: "Healthy ✅" };
    if (result.margin >= 0) return { zh: "利潤偏低 ⚠️", en: "Low margin ⚠️" };
    return { zh: "虧損 ❌", en: "Loss ❌" };
  }, [result.margin]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "淨收入", en: "Net income" }, `$${result.net.toFixed(2)}`],
      [{ zh: "交易費", en: "Transaction" }, `$${result.transaction.toFixed(2)}`],
      [{ zh: "支付處理費", en: "Payment" }, `$${result.payment.toFixed(2)}`],
      [{ zh: "站外廣告", en: "Offsite" }, `$${result.offsite.toFixed(2)}`],
      [{ zh: "利潤率", en: "Margin" }, pct(result.margin)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setTier("none"); setPrice("25"); setCost("8"); }
  function fillHighSalary() { setTier("high"); setPrice("45"); setCost("15"); }

  const activeBand = bands.find(b => b.key === (tier === "none" ? "transaction" : tier === "low" ? "offsite" : "net")) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${result.net.toFixed(2)}</div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{pct(result.margin)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${result.fees.toFixed(1)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyEquiv}</div><div className="font-black">${result.transaction.toFixed(1)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "none" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("none")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "low" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("low")}>{lang === "zh" ? "站外12%" : "Offsite 12%"}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "high" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("high")}>{lang === "zh" ? "站外15%" : "Offsite 15%"}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$25</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "售價 $25 · 成本 $8" : "Price $25 · cost $8"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$45</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "售價 $45 · 成本 $15" : "Price $45 · cost $15"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={price} onChange={(e) => setPrice(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{lang === "zh" ? "商品成本（USD）" : "Product cost (USD)"}<input type="number" min="0" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={cost} onChange={(e) => setCost(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${result.net.toFixed(0)}<span className="text-2xl">{lang === "zh" ? " 淨收" : " net"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.dailyEquiv}</div><div className="mt-1 text-xl font-black">{pct(result.margin)}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "費用" : "fees"} ${result.fees.toFixed(1)}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">6.5%</div><p className="mt-2 text-3xl font-black text-emerald-950">${result.transaction.toFixed(1)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "交易費" : "transaction"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">3%+$0.25</div><p className="mt-2 text-3xl font-black text-blue-950">${result.payment.toFixed(1)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "支付費" : "payment"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.fatLossTarget}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "成本" : "cost"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.cost)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="etsy-fee-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "判定" : "Verdict"}</div><div className="mt-1 text-2xl font-black">{l(verdict, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${fmt(Number(price))}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${result.net.toFixed(0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸售價" : "Price", note: t.bmrStep }, { label: lang === "zh" ? "扣Etsy費" : "Etsy fees", note: t.deficitStep }, { label: lang === "zh" ? "扣成本" : "Cost", note: t.trendStep }, { label: lang === "zh" ? "得淨收" : "Net", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="etsy-fee-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "費率", "站外", "報表"] : ["Batch", "Rates", "Offsite", "Report"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
