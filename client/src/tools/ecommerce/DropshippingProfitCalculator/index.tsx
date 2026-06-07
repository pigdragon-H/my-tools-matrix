// @profile B
// Profile B · 電商-工具 · DropshippingProfitCalculator（GOLD-STANDARD-001 compatible）

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

const PLATFORM_RATE = 0.05;

type VolumeTier = "small" | "medium" | "large";
const VOLUME: Record<string, number> = { small: 50, medium: 200, large: 600 };

const bands = [
  { key: "gross", range: "price-costs", label: { zh: "毛利", en: "Gross profit" }, desc: { zh: "毛利 = 售價 − 供應商成本 − 運費 − 廣告費 − 平台費,是代發貨單筆訂單實際留下的金額。", en: "Gross = price - supplier cost - shipping - ad cost - platform fee, the amount a single dropship order keeps." } },
  { key: "margin", range: "gross/sale", label: { zh: "毛利率", en: "Margin" }, desc: { zh: "毛利率 = 毛利 ÷ 售價;代發貨常見毛利率約 15-30%,低於 10% 在扣廣告後容易虧損。", en: "Margin = gross / sale price; dropshipping margin is usually ~15-30%, below 10% often loses money after ads." } },
  { key: "ad", range: "ad spend", label: { zh: "廣告費", en: "Ad cost" }, desc: { zh: "廣告費是代發貨最大變數,獲客成本過高會吃掉毛利,需以毛利反推可負擔的單次獲客成本。", en: "Ad cost is the biggest dropshipping variable; high acquisition cost eats margin, so back-solve affordable cost per acquisition from gross." } },
  { key: "shipping", range: "per order", label: { zh: "運費", en: "Shipping" }, desc: { zh: "代發貨運費通常由供應商出貨,需確認是否含關稅與時效,慢速物流會增加退款與差評風險。", en: "Dropship shipping is usually fulfilled by the supplier; confirm duties and delivery time, as slow logistics raise refund and bad-review risk." } },
  { key: "monthly", range: "gross x qty", label: { zh: "月收入", en: "Monthly" }, desc: { zh: "月收入預估 = 單筆毛利 × 月銷量;用來判斷該品項在當前廣告效率下能否撐起營運成本。", en: "Monthly estimate = per-order gross x monthly quantity, used to judge whether the item can carry operating costs at current ad efficiency." } },
  { key: "review", range: "per SKU", label: { zh: "逐品檢視", en: "Per SKU" }, desc: { zh: "建議每個 SKU 單獨計算毛利與廣告效率,避免熱賣但實際虧損的品項拖垮整體獲利。", en: "Compute gross and ad efficiency per SKU to avoid best-sellers that actually lose money dragging down overall profit." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "亞馬遜FBA計算機", en: "Amazon FBA" }, href: "/tools/ecommerce/amazon-fba-calculator" },
  { label: { zh: "Etsy費用計算機", en: "Etsy Fee" }, href: "/tools/ecommerce/etsy-fee-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost" }, href: "/tools/ecommerce/shipping-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 代發貨 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Dropshipping Profit Calculator · 代發貨獲利計算機", subtitle: "計算售價扣供應商成本、運費、廣告費後的毛利、毛利率與月收入",
    intro: "本工具把你輸入的售價,扣除供應商成本、運費、廣告費與平台費,即時算出單筆毛利、毛利率與依月銷量估算的月收入,協助你在投放廣告前判斷該代發貨品項是否真的賺錢。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以你輸入的成本與一般平台費率（約 5%）估算,屬選品參考;實際平台費、金流費與廣告獲客成本因平台與市場而異,正式數字請以各平台後台為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例售價即時計算", examplePreview: "毛利", examplePerson: "毛利率", flowDemo: "月收入", fillExample: "載入範例 · 起步", previewActivePath: "載入範例 · 成熟",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入售價、成本與廣告費", examplesHelper: "先用範例了解代發貨毛利結構,再輸入你自己的售價、供應商成本、運費與廣告費,即可得到單筆毛利、毛利率與月收入預估。",
    metric: "起步", imperial: "成熟", exampleCards: "範例卡", baselineExample: "範例 · 起步", activeExample: "範例 · 成熟", calculator: "計算器",
    modeLabel: "月銷量等級", countLabel: "商品售價（USD）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "代發貨獲利結果", estimatedTdee: "毛利", monthlyEquiv: "廣告費", weeklyEquiv: "運費", dailyEquiv: "毛利率", effectiveHours: "月收入", fatLossTarget: "成本",
    outputLabel: "代發貨獲利分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格代發貨獲利結構矩陣", tdeeMatrixNote: "L7 固定六格,列出代發貨各項成本與獲利指標;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把獲利計算整合進選品與廣告策略", conversionNote: "L9 會連動目前計算結果,顯示毛利、毛利率與月收入,協助你判斷該品項是否值得投放廣告與如何定價。",
    progressInsight: "進度洞察卡", possibleTarget: "目前選品計算", dailyGap: "毛利", weeklyTrend: "售價", motivation: "動力卡", keepMomentum: "從單筆試算走向長期廣告獲利管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次試算帶進你的選品清單", journeyHint: "每次更換商品、調整售價或廣告預算時重新計算,並把結果記錄到選品表或獲利管理系統。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用亞馬遜FBA計算機比較有倉儲模式的利潤", nextActionItem2: "用定價計算機反推達成目標毛利率的售價", nextActionItem3: "用運費計算機估算自配送的物流成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸售價 → 扣成本 → 扣廣告 → 得毛利", bmrStep: "輸售價", deficitStep: "扣成本", trendStep: "扣廣告", mealStep: "得毛利",
    knowledge: "知識", knowledgeTitle: "代發貨毛利與廣告的意義", definition: "定義", definitionText: "代發貨由賣家上架商品、收單後由供應商直接出貨,賣家不持有庫存;毛利是售價扣除供應商成本、運費、廣告費與平台費後留下的金額。",
    formula: "公式", formulaText: "毛利 = 售價 − 供應商成本 − 運費 − 廣告費 − 平台費;毛利率 = 毛利 ÷ 售價;月收入預估 = 單筆毛利 × 月銷量。",
    limitations: "限制", limitationsText: "本工具以一般平台費率估算,屬選品參考;實際平台費、金流費與廣告獲客成本因平台與市場而異,退款與糾紛也會影響真實獲利,正式數字以平台後台為準。",
    interpretation: "解讀", interpretationText: "毛利率高於 30% 為優、15-30% 健康、10-15% 偏低、低於 10% 扣廣告後易虧;月收入需能覆蓋固定營運成本,選品時毛利率與廣告效率宜並看。",
    context: "脈絡", contextText: "了解代發貨毛利可協助賣家在投放廣告與擴大選品前評估真實獲利,避免熱賣卻虧損,並把預算集中在獲客成本可負擔的品項。",
    example: "範例", exampleText: "售價 $30、供應商成本 $10、運費 $4、廣告費 $6、平台費 5%（$1.5）,單筆毛利約 $8.5,毛利率約 28%,月銷 200 件月收入約 $1,700。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "電商選品工作流程的下一步工具", premiumTitle: "專業版代發貨賣家工具包", premiumText: "解鎖多 SKU 批次試算、廣告獲客成本反推、月損益預估與長期獲利追蹤報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做代發貨毛利與廣告獲利估算,屬選品參考;不構成投資建議,正式費用以各平台後台為準。", relatedTools: "相關工具", relatedToolsText: "亞馬遜FBA計算機 · Etsy費用計算機 · 定價計算機 · 運費計算機", references: "參考資料", referencesText: "電商毛利率與獲客成本評估原則;各平台交易費與金流費結構;廣告投資報酬率與單次獲客成本概念。",
    q1: "代發貨毛利怎麼算？", a1: "毛利 = 售價 − 供應商成本 − 運費 − 廣告費 − 平台費;代發貨因不持有庫存,毛利率看似不錯,但廣告獲客成本常是最大支出,務必納入計算。",
    q2: "毛利率多少才健康？", a2: "代發貨健康毛利率約 15-30%,高於 30% 為優,低於 10% 在扣除廣告後很容易虧損;需同時看月銷量與獲客成本才能判斷品項是否可持續。",
    q3: "廣告費怎麼估？", a3: "可用單筆毛利反推可負擔的單次獲客成本;若獲客成本接近或超過毛利,代表該品項在當前廣告效率下難以獲利,需優化素材或換品。",
    q4: "為什麼每次結果不同？", a4: "售價、供應商成本、運費與廣告費不同,結果自然不同;這很正常,建議依實際品項與真實廣告數據輸入,才能得到貼近真實的獲利估算。",
    q5: "怎麼提高代發貨獲利？", a5: "可從降低供應商成本、談更低運費、提高售價或優化廣告降低獲客成本著手;選品階段先用本工具篩掉毛利或廣告效率差的品項最有效。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有售價、成本與廣告費計算都在你的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "E-Commerce · Dropshipping · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Dropshipping Profit Calculator", subtitle: "Compute gross profit, margin, and monthly income after supplier, shipping, and ad costs",
    intro: "This tool takes the sale price you enter and subtracts supplier cost, shipping, ad cost, and platform fee to instantly compute per-order gross profit, margin, and a monthly income estimate by sales volume, helping you decide whether a dropshipping product truly makes money before running ads. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates with your costs and a general platform rate (~5%) and is a sourcing reference; actual platform, payment, and ad-acquisition costs vary by platform and market \u2014 confirm in each platform dashboard. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample price and compute", examplePreview: "Gross", examplePerson: "Margin", flowDemo: "Monthly", fillExample: "Load sample · starter", previewActivePath: "Load sample · mature",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter price, cost, and ad cost", examplesHelper: "Start with a sample to understand the dropshipping margin structure, then enter your own sale price, supplier cost, shipping, and ad cost to get per-order gross, margin, and a monthly income estimate.",
    metric: "Starter", imperial: "Mature", exampleCards: "Example cards", baselineExample: "Sample · starter", activeExample: "Sample · mature", calculator: "Calculator",
    modeLabel: "Monthly volume tier", countLabel: "Sale price (USD)", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Dropshipping profit result", estimatedTdee: "Gross", monthlyEquiv: "Ad cost", weeklyEquiv: "Shipping", dailyEquiv: "Margin", effectiveHours: "Monthly", fatLossTarget: "Cost",
    outputLabel: "Dropshipping profit summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band dropshipping profit-structure matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 lists dropshipping costs and profit metrics. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit profit calculation into sourcing and ad strategy", conversionNote: "L9 reflects your current calculation \u2014 gross, margin, and monthly income \u2014 to help you decide whether to run ads on the item and how to price it.",
    progressInsight: "Progress insight", possibleTarget: "Your current sourcing calc", dailyGap: "Gross", weeklyTrend: "Sale price", motivation: "Motivation", keepMomentum: "Move from a single calc to long-term ad-profit management",
    saveShareJourney: "Save / share", journeyTitle: "Take this calc into your sourcing list", journeyHint: "Recompute whenever you change the product, price, or ad budget, and log the result into a sourcing sheet or profit-management system.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Amazon FBA Calculator to compare a warehoused model", nextActionItem2: "Use the Pricing Calculator to back into a price for a target margin", nextActionItem3: "Use the Shipping Cost Calculator to estimate self-fulfillment logistics",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Price → Subtract cost → Subtract ads → Gross", bmrStep: "Price", deficitStep: "Cost", trendStep: "Ads", mealStep: "Gross",
    knowledge: "Knowledge", knowledgeTitle: "What dropshipping gross profit and ads mean", definition: "Definition", definitionText: "In dropshipping, sellers list products and the supplier ships directly after an order, so sellers hold no inventory; gross profit is what remains after subtracting supplier cost, shipping, ad cost, and platform fee from the sale price.",
    formula: "Formula", formulaText: "Gross = price - supplier cost - shipping - ad cost - platform fee; margin = gross / price; monthly estimate = per-order gross x monthly quantity.",
    limitations: "Limitations", limitationsText: "This tool estimates with a general platform rate and is a sourcing reference; actual platform, payment, and ad-acquisition costs vary by platform and market, and refunds and disputes also affect true profit \u2014 the platform dashboard governs.",
    interpretation: "Interpretation", interpretationText: "A margin above 30% is great, 15-30% healthy, 10-15% low, below 10% often loses after ads; monthly income must cover fixed operating costs, so view margin and ad efficiency together when selecting products.",
    context: "Context", contextText: "Knowing dropshipping margin helps sellers assess true profit before running ads and scaling product range, avoiding best-sellers that lose money and focusing budget on items with affordable acquisition cost.",
    example: "Example", exampleText: "Price $30, supplier cost $10, shipping $4, ad cost $6, 5% platform fee ($1.5) gives ~$8.5 per-order gross, ~28% margin; at 200 units monthly income is ~$1,700.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for an e-commerce sourcing workflow", premiumTitle: "Pro Dropshipping Seller Toolkit", premiumText: "Unlock multi-SKU batch calculation, ad-acquisition cost back-solving, monthly P&L estimation, and long-term profit-tracking reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only estimates dropshipping gross and ad profit and is a sourcing reference; it is not investment advice \u2014 actual fees follow each platform dashboard.", relatedTools: "Related tools", relatedToolsText: "Amazon FBA Calculator · Etsy Fee Calculator · Pricing Calculator · Shipping Cost Calculator", references: "References", referencesText: "E-commerce margin and acquisition-cost evaluation principles; platform transaction and payment fee structures; advertising ROI and cost-per-acquisition concepts.",
    q1: "How is dropshipping gross profit calculated?", a1: "Gross = price - supplier cost - shipping - ad cost - platform fee; since dropshipping holds no inventory, margin looks attractive, but ad-acquisition cost is often the biggest expense and must be included.",
    q2: "What margin is healthy?", a2: "A healthy dropshipping margin is ~15-30%, above 30% great, below 10% often loses after ads; view monthly volume and acquisition cost together to judge whether an item is sustainable.",
    q3: "How do I estimate ad cost?", a3: "Back-solve affordable cost per acquisition from per-order gross; if acquisition cost nears or exceeds gross, the item is hard to profit on at current ad efficiency, so optimize creatives or switch products.",
    q4: "Why does each result differ?", a4: "Price, supplier cost, shipping, and ad cost differ, so results differ; this is normal \u2014 enter real product and ad figures to get a profit estimate close to actual.",
    q5: "How do I raise dropshipping profit?", a5: "Lower supplier cost, negotiate cheaper shipping, raise price, or optimize ads to cut acquisition cost; screening out low-margin or low-ad-efficiency items at the sourcing stage with this tool is most effective.",
    q6: "Does this tool upload my data?", a6: "No. All price, cost, and ad calculations run locally in your browser \u2014 the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function DropshippingProfitCalculator() {
  const { lang, setLang } = useLanguage();
  const [tier, setTier] = useState<VolumeTier>("small");
  const [price, setPrice] = useState("30");
  const [cost, setCost] = useState("10");
  const [shipping, setShipping] = useState("4");
  const [ad, setAd] = useState("6");
  const t = ui[lang];

  const result = useMemo(() => {
    const p = Math.max(0, Number(price) || 0);
    const c = Math.max(0, Number(cost) || 0);
    const s = Math.max(0, Number(shipping) || 0);
    const a = Math.max(0, Number(ad) || 0);
    const platform = p * PLATFORM_RATE;
    const gross = p - c - s - a - platform;
    const margin = p > 0 ? (gross / p) * 100 : 0;
    const monthly = gross * VOLUME[tier];
    return { gross, platform, margin, monthly, ad: a, shipping: s, cost: c };
  }, [tier, price, cost, shipping, ad]);

  const verdict = useMemo<LocalText>(() => {
    if (result.margin >= 30) return { zh: "優異毛利 🚀", en: "Great margin 🚀" };
    if (result.margin >= 15) return { zh: "健康毛利 ✅", en: "Healthy ✅" };
    if (result.margin >= 0) return { zh: "毛利偏低 ⚠️", en: "Low margin ⚠️" };
    return { zh: "虧損 ❌", en: "Loss ❌" };
  }, [result.margin]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "單筆毛利", en: "Gross" }, `$${result.gross.toFixed(2)}`],
      [{ zh: "廣告費", en: "Ad cost" }, `$${result.ad.toFixed(2)}`],
      [{ zh: "運費", en: "Shipping" }, `$${result.shipping.toFixed(2)}`],
      [{ zh: "毛利率", en: "Margin" }, pct(result.margin)],
      [{ zh: "月收入", en: "Monthly" }, `$${fmt(result.monthly)}`],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setTier("small"); setPrice("30"); setCost("10"); setShipping("4"); setAd("6"); }
  function fillHighSalary() { setTier("large"); setPrice("55"); setCost("18"); setShipping("6"); setAd("9"); }

  const activeBand = bands.find(b => b.key === (tier === "small" ? "gross" : tier === "medium" ? "margin" : "monthly")) || bands[0];

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${result.gross.toFixed(2)}</div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{pct(result.margin)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(result.monthly)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyEquiv}</div><div className="font-black">${result.ad.toFixed(1)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "small" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("small")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "medium" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("medium")}>{lang === "zh" ? "成長" : "Growth"}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "large" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("large")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$30</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "售價 $30 · 成本 $10" : "Price $30 · cost $10"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$55</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "售價 $55 · 成本 $18" : "Price $55 · cost $18"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={price} onChange={(e) => setPrice(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "供應商成本（USD）" : "Supplier cost (USD)"}<input type="number" min="0" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cost} onChange={(e) => setCost(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "運費（USD）" : "Shipping (USD)"}<input type="number" min="0" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={shipping} onChange={(e) => setShipping(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{lang === "zh" ? "廣告費（USD）" : "Ad cost (USD)"}<input type="number" min="0" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={ad} onChange={(e) => setAd(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${result.gross.toFixed(0)}<span className="text-2xl">{lang === "zh" ? " 毛利" : " gross"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.dailyEquiv}</div><div className="mt-1 text-xl font-black">{pct(result.margin)}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "月" : "mo"} ${fmt(result.monthly)}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">ads</div><p className="mt-2 text-3xl font-black text-emerald-950">${result.ad.toFixed(1)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "廣告費" : "ad cost"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">ship</div><p className="mt-2 text-3xl font-black text-blue-950">${result.shipping.toFixed(1)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "運費" : "shipping"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.fatLossTarget}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "成本" : "cost"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.cost)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="dropshipping-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "判定" : "Verdict"}</div><div className="mt-1 text-2xl font-black">{l(verdict, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${fmt(Number(price))}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${result.gross.toFixed(0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸售價" : "Price", note: t.bmrStep }, { label: lang === "zh" ? "扣成本" : "Cost", note: t.deficitStep }, { label: lang === "zh" ? "扣廣告" : "Ads", note: t.trendStep }, { label: lang === "zh" ? "得毛利" : "Gross", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="dropshipping-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "獲客", "損益", "報表"] : ["Batch", "CAC", "P&L", "Report"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
