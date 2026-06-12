// @profile B
// Profile B · 電商-工具 · AmazonFbaCalculator（GOLD-STANDARD-001 compatible）

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

const REFERRAL_RATE = 0.15;
const SIZE_FEE: Record<string, number> = { small: 3.22, large: 5.4, oversize: 9.5 };

type SizeTier = "small" | "large" | "oversize";

const bands = [
  { key: "referral", range: "15%", label: { zh: "推薦費", en: "Referral fee" }, desc: { zh: "Amazon 對大多數類別收取約 15% 的推薦費,以商品售價為基礎,是最主要的平台抽成。", en: "Amazon charges ~15% referral fee on the sale price for most categories — the main platform cut." } },
  { key: "fba", range: "$3-10", label: { zh: "物流費", en: "Fulfillment" }, desc: { zh: "FBA 出貨費依商品尺寸與重量分級,標準小件約 $3、大件 $5、超大件 $9 以上。", en: "FBA fulfillment fee scales by size/weight — ~$3 small, $5 large, $9+ oversize." } },
  { key: "storage", range: "monthly", label: { zh: "倉儲費", en: "Storage" }, desc: { zh: "倉儲費按體積與月份計算,旺季費率較高;滯銷庫存還有長期倉儲附加費。", en: "Storage fees scale by volume and month, higher in peak season; aged stock incurs long-term surcharges." } },
  { key: "margin", range: "profit/sale", label: { zh: "利潤率", en: "Margin" }, desc: { zh: "利潤率 = 淨利潤 ÷ 售價;一般電商健康利潤率約 15-30%,低於 10% 風險偏高。", en: "Margin = net profit / sale price; a healthy e-commerce margin is ~15-30%, below 10% is risky." } },
  { key: "roi", range: "profit/cost", label: { zh: "投資報酬率", en: "ROI" }, desc: { zh: "ROI = 淨利潤 ÷ 商品成本;反映每投入一元成本能賺回多少,常用於選品決策。", en: "ROI = net profit / product cost; shows return per cost dollar, used for product selection." } },
  { key: "review", range: "per SKU", label: { zh: "逐品檢視", en: "Per SKU" }, desc: { zh: "建議按每個 SKU 計算費用與利潤,避免熱賣但實際虧損的隱形賠錢品。", en: "Compute fees and profit per SKU to avoid hidden money-losers that sell well but lose money." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "代發貨獲利計算機", en: "Dropshipping Profit" }, href: "/tools/ecommerce/dropshipping-profit-calculator" },
  { label: { zh: "Etsy費用計算機", en: "Etsy Fee" }, href: "/tools/ecommerce/etsy-fee-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost" }, href: "/tools/ecommerce/shipping-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · Amazon FBA · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Amazon FBA Calculator · 亞馬遜FBA費用計算機", subtitle: "計算 FBA 推薦費、物流費後的淨利潤、利潤率與 ROI",
    intro: "本工具把您輸入的商品售價,扣除 Amazon 推薦費（約 15%）、FBA 物流費（依尺寸分級）、商品成本與其他費用,即時算出淨利潤、利潤率與投資報酬率（ROI），協助您在選品與定價前評估每件商品是否真的賺錢。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以一般費率（推薦費 15%、FBA 分級費）估算,屬選品參考;實際費率因類別、尺寸、季節與促銷而異,正式數字請以 Amazon Seller Central 的費用預覽為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例售價即時計算", examplePreview: "淨利潤", examplePerson: "利潤率", flowDemo: "ROI", fillExample: "載入範例 · 小件", previewActivePath: "載入範例 · 大件",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入售價、成本與尺寸分級", examplesHelper: "先用範例了解 FBA 費用結構,再輸入您自己的售價、商品成本、尺寸分級與其他費用,即可得到淨利潤、利潤率與 ROI。",
    metric: "小件", imperial: "大件", exampleCards: "範例卡", baselineExample: "範例 · 小件", activeExample: "範例 · 大件", calculator: "計算器",
    modeLabel: "尺寸分級", countLabel: "商品售價（USD）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "FBA 利潤結果", estimatedTdee: "淨利潤", monthlyEquiv: "推薦費", weeklyEquiv: "物流費", dailyEquiv: "利潤率", effectiveHours: "ROI", fatLossTarget: "成本",
    outputLabel: "FBA 利潤分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 FBA 費用結構矩陣", tdeeMatrixNote: "L7 固定六格,列出 FBA 各項費用與利潤指標;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把利潤計算整合進選品策略", conversionNote: "L9 會連動目前計算結果,顯示淨利潤、利潤率與 ROI,協助您判斷該商品是否值得上架與如何定價。",
    progressInsight: "進度洞察卡", possibleTarget: "目前選品計算", dailyGap: "淨利潤", weeklyTrend: "售價", motivation: "動力卡", keepMomentum: "從單件試算走向長期選品管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次試算帶進您的選品清單", journeyHint: "每次更換商品或調整售價時重新計算,並把結果記錄到選品表或利潤管理系統。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用代發貨獲利計算機比較無庫存模式的利潤", nextActionItem2: "用定價計算機反推達成目標利潤率的售價", nextActionItem3: "用運費計算機估算自配送的物流成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸售價 → 扣費用 → 扣成本 → 得淨利", bmrStep: "輸售價", deficitStep: "扣費用", trendStep: "扣成本", mealStep: "得淨利",
    knowledge: "知識", knowledgeTitle: "FBA 費用與利潤的意義", definition: "定義", definitionText: "Amazon FBA 由賣家把貨送到 Amazon 倉庫,由其代為揀貨、出貨與客服;賣家需支付推薦費、物流費與倉儲費等,淨利潤是扣除所有費用後的所得。",
    formula: "公式", formulaText: "淨利潤 = 售價 − 推薦費 − FBA 物流費 − 商品成本 − 其他費用;利潤率 = 淨利潤 ÷ 售價;ROI = 淨利潤 ÷ 商品成本。",
    limitations: "限制", limitationsText: "本工具以一般費率估算,屬選品參考;實際推薦費率因類別而異、物流費依精確尺寸重量分級,倉儲與促銷費另計,正式數字以 Seller Central 為準。",
    interpretation: "解讀", interpretationText: "利潤率高於 30% 為優、15-30% 健康、10-15% 偏低、低於 10% 風險高;ROI 越高代表資金週轉效率越好,選品時兩者宜並看。",
    context: "脈絡", contextText: "了解 FBA 費用可協助賣家在選品、定價與補貨前評估真實利潤,避免熱賣卻虧損,並把資金投入報酬率較高的商品。",
    example: "範例", exampleText: "售價 $25、商品成本 $8、小件 FBA 費 $3.22、推薦費 15%（$3.75），其他費用 $1,淨利潤約 $9.03,利潤率約 36%,ROI 約 113%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "電商選品工作流程的下一步工具", premiumTitle: "專業版 Amazon 賣家工具包", premiumText: "解鎖精確尺寸重量費率表、多 SKU 批次試算、倉儲費預估與長期利潤追蹤報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做 FBA 費用與利潤估算,屬選品參考;不構成投資建議,正式費用以 Amazon Seller Central 為準。", relatedTools: "相關工具", relatedToolsText: "代發貨獲利計算機 · Etsy費用計算機 · 定價計算機 · 運費計算機", references: "參考資料", referencesText: "Amazon 推薦費率表;FBA 物流費分級;倉儲費與長期倉儲附加費;電商利潤率與 ROI 評估原則。",
    q1: "FBA 主要有哪些費用？", a1: "主要有推薦費（約 15%）、FBA 物流費（依尺寸重量分級）與倉儲費;此外可能有促銷費、退貨處理費與長期倉儲附加費,實際以 Seller Central 為準。",
    q2: "利潤率多少才健康？", a2: "一般電商健康利潤率約 15-30%,高於 30% 為優,低於 10% 風險偏高;但需同時看 ROI 與銷量,薄利多銷與高利潤低量是不同策略。",
    q3: "ROI 和利潤率差在哪？", a3: "利潤率是淨利潤佔售價的比例,反映單件賺錢能力;ROI 是淨利潤佔商品成本的比例,反映資金週轉效率,選品時兩者並看更準確。",
    q4: "為什麼每次結果不同？", a4: "售價、成本、尺寸分級與其他費用不同,結果自然不同;這很正常,建議依實際商品輸入精確數字,才能得到貼近真實的利潤估算。",
    q5: "怎麼提高 FBA 利潤？", a5: "可從降低商品成本、優化尺寸重量以降物流費、提高售價或加快週轉減少倉儲費著手;選品階段先用本工具篩掉低利潤商品最有效。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有售價、成本與費用計算都在您的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "E-Commerce · Amazon FBA · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Amazon FBA Calculator", subtitle: "Compute net profit, margin, and ROI after FBA referral and fulfillment fees",
    intro: "This tool takes the sale price you enter and subtracts the Amazon referral fee (~15%), FBA fulfillment fee (by size tier), product cost, and other costs to instantly compute net profit, margin, and ROI, helping you assess whether each item truly makes money before sourcing and pricing. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates with general rates (15% referral, tiered FBA fees) and is a sourcing reference; actual rates vary by category, size, season, and promotion — confirm with the Seller Central fee preview. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample price and compute", examplePreview: "Net profit", examplePerson: "Margin", flowDemo: "ROI", fillExample: "Load sample · small", previewActivePath: "Load sample · large",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter price, cost, and size tier", examplesHelper: "Start with a sample to understand the FBA fee structure, then enter your own sale price, product cost, size tier, and other costs to get net profit, margin, and ROI.",
    metric: "Small", imperial: "Large", exampleCards: "Example cards", baselineExample: "Sample · small", activeExample: "Sample · large", calculator: "Calculator",
    modeLabel: "Size tier", countLabel: "Sale price (USD)", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "FBA profit result", estimatedTdee: "Net profit", monthlyEquiv: "Referral", weeklyEquiv: "Fulfillment", dailyEquiv: "Margin", effectiveHours: "ROI", fatLossTarget: "Cost",
    outputLabel: "FBA profit summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band FBA fee-structure matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists FBA fees and profit metrics. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit profit calculation into sourcing strategy", conversionNote: "L9 reflects your current calculation — net profit, margin, and ROI — to help you decide whether to list the item and how to price it.",
    progressInsight: "Progress insight", possibleTarget: "Your current sourcing calc", dailyGap: "Net profit", weeklyTrend: "Sale price", motivation: "Motivation", keepMomentum: "Move from a single calc to long-term sourcing management",
    saveShareJourney: "Save / share", journeyTitle: "Take this calc into your sourcing list", journeyHint: "Recompute whenever you change the item or price, and log the result into a sourcing sheet or profit-management system.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Dropshipping Profit Calculator to compare the no-inventory model", nextActionItem2: "Use the Pricing Calculator to back into a price for a target margin", nextActionItem3: "Use the Shipping Cost Calculator to estimate self-fulfillment logistics",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Price → Subtract fees → Subtract cost → Net profit", bmrStep: "Price", deficitStep: "Fees", trendStep: "Cost", mealStep: "Net",
    knowledge: "Knowledge", knowledgeTitle: "What FBA fees and profit mean", definition: "Definition", definitionText: "With Amazon FBA, sellers ship inventory to Amazon warehouses, and Amazon picks, ships, and handles customer service; sellers pay referral, fulfillment, and storage fees, and net profit is what remains after all fees.",
    formula: "Formula", formulaText: "Net profit = price - referral fee - FBA fulfillment fee - product cost - other costs; margin = net profit / price; ROI = net profit / product cost.",
    limitations: "Limitations", limitationsText: "This tool estimates with general rates and is a sourcing reference; actual referral rates vary by category, fulfillment fees follow precise size/weight tiers, and storage and promo fees are separate — Seller Central governs.",
    interpretation: "Interpretation", interpretationText: "A margin above 30% is great, 15-30% healthy, 10-15% low, below 10% risky; higher ROI means better capital turnover — view both when selecting products.",
    context: "Context", contextText: "Knowing FBA fees helps sellers assess true profit before sourcing, pricing, and restocking, avoiding best-sellers that lose money and steering capital to higher-ROI items.",
    example: "Example", exampleText: "Price $25, cost $8, small FBA fee $3.22, 15% referral ($3.75), other $1 gives ~$9.03 net profit, ~36% margin, ~113% ROI.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for an e-commerce sourcing workflow", premiumTitle: "Pro Amazon Seller Toolkit", premiumText: "Unlock precise size/weight rate tables, multi-SKU batch calculation, storage-fee estimation, and long-term profit-tracking reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only estimates FBA fees and profit and is a sourcing reference; it is not investment advice — actual fees follow Amazon Seller Central.", relatedTools: "Related tools", relatedToolsText: "Dropshipping Profit Calculator · Etsy Fee Calculator · Pricing Calculator · Shipping Cost Calculator", references: "References", referencesText: "Amazon referral-fee schedule; FBA fulfillment-fee tiers; storage and long-term storage surcharges; e-commerce margin and ROI evaluation principles.",
    q1: "What are the main FBA fees?", a1: "Mainly the referral fee (~15%), FBA fulfillment fee (by size/weight tier), and storage fee; there may also be promo fees, return-processing fees, and long-term storage surcharges — Seller Central governs.",
    q2: "What margin is healthy?", a2: "A healthy e-commerce margin is ~15-30%, above 30% great, below 10% risky; but view ROI and sales volume too — thin-margin high-volume and high-margin low-volume are different strategies.",
    q3: "ROI vs margin?", a3: "Margin is net profit as a share of price, showing per-unit profitability; ROI is net profit as a share of product cost, showing capital turnover — view both for accurate product selection.",
    q4: "Why does each result differ?", a4: "Price, cost, size tier, and other costs differ, so results differ; this is normal — enter precise figures for the real item to get a profit estimate close to actual.",
    q5: "How do I raise FBA profit?", a5: "Lower product cost, optimize size/weight to cut fulfillment fees, raise price, or speed turnover to cut storage fees; screening out low-margin items at the sourcing stage with this tool is most effective.",
    q6: "Does this tool upload my data?", a6: "No. All price, cost, and fee calculations run locally in your browser — the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function AmazonFbaCalculator() {
  const { lang, setLang } = useLanguage();
  const [tier, setTier] = useState<SizeTier>("small");
  const [price, setPrice] = useState("25");
  const [cost, setCost] = useState("8");
  const [other, setOther] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const p = Math.max(0, Number(price) || 0);
    const c = Math.max(0, Number(cost) || 0);
    const o = Math.max(0, Number(other) || 0);
    const referral = p * REFERRAL_RATE;
    const fba = SIZE_FEE[tier];
    const net = p - referral - fba - c - o;
    const margin = p > 0 ? (net / p) * 100 : 0;
    const roi = c > 0 ? (net / c) * 100 : 0;
    return { net, referral, fba, margin, roi, cost: c };
  }, [tier, price, cost, other]);

  const verdict = useMemo<LocalText>(() => {
    if (result.margin >= 30) return { zh: "優異利潤 🚀", en: "Great margin 🚀" };
    if (result.margin >= 15) return { zh: "健康利潤 ✅", en: "Healthy ✅" };
    if (result.margin >= 0) return { zh: "利潤偏低 ⚠️", en: "Low margin ⚠️" };
    return { zh: "虧損 ❌", en: "Loss ❌" };
  }, [result.margin]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "淨利潤", en: "Net profit" }, `$${result.net.toFixed(2)}`],
      [{ zh: "推薦費", en: "Referral" }, `$${result.referral.toFixed(2)}`],
      [{ zh: "物流費", en: "Fulfillment" }, `$${result.fba.toFixed(2)}`],
      [{ zh: "利潤率", en: "Margin" }, pct(result.margin)],
      [{ zh: "ROI", en: "ROI" }, pct(result.roi)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setTier("small"); setPrice("25"); setCost("8"); setOther("1"); }
  function fillHighSalary() { setTier("large"); setPrice("45"); setCost("15"); setOther("2"); }

  const activeBand = bands.find(b => b.key === (tier === "small" ? "fba" : tier === "large" ? "referral" : "storage")) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${result.net.toFixed(2)}</div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{pct(result.margin)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{pct(result.roi)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyEquiv}</div><div className="font-black">${result.referral.toFixed(1)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "small" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("small")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "large" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("large")}>{t.imperial}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${tier === "oversize" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setTier("oversize")}>{lang === "zh" ? "超大" : "Oversize"}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$25</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "售價 $25 · 成本 $8" : "Price $25 · cost $8"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$45</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "售價 $45 · 成本 $15" : "Price $45 · cost $15"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={price} onChange={(e) => setPrice(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "商品成本（USD）" : "Product cost (USD)"}<input type="number" min="0" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cost} onChange={(e) => setCost(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{lang === "zh" ? "其他費用（USD）" : "Other costs (USD)"}<input type="number" min="0" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={other} onChange={(e) => setOther(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${result.net.toFixed(0)}<span className="text-2xl">{lang === "zh" ? " 淨利" : " net"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.dailyEquiv}</div><div className="mt-1 text-xl font-black">{pct(result.margin)}</div><div className="mt-1 text-xs text-slate-300">ROI {pct(result.roi)}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">15%</div><p className="mt-2 text-3xl font-black text-emerald-950">${result.referral.toFixed(1)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "推薦費" : "referral"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">FBA</div><p className="mt-2 text-3xl font-black text-blue-950">${result.fba.toFixed(1)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "物流費" : "fee"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.fatLossTarget}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "成本" : "cost"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.cost)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="amazon-fba-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸售價" : "Price", note: t.bmrStep }, { label: lang === "zh" ? "扣費用" : "Fees", note: t.deficitStep }, { label: lang === "zh" ? "扣成本" : "Cost", note: t.trendStep }, { label: lang === "zh" ? "得淨利" : "Net", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="amazon-fba-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["費率表", "批次", "倉儲", "報表"] : ["Rates", "Batch", "Storage", "Report"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
