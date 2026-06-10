// @profile B
// Profile B · 計算機-Finance · GST 計算機（GOLD-STANDARD-001 compatible）

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
  { key: "low", range: "≤5%", label: { zh: "低稅率", en: "Low rate" }, desc: { zh: "低 GST/消費稅率，常見於新加坡早期、馬來西亞等地。", en: "Low GST/consumption-tax rate \u2014 common in early Singapore, Malaysia, and similar regions." } },
  { key: "sing", range: "6–8%", label: { zh: "中低", en: "Mid-low" }, desc: { zh: "中低稅率，常見於新加坡、加拿大聯邦 GST。", en: "Mid-low rate \u2014 common for Singapore and Canadian federal GST." } },
  { key: "nz", range: "9–12%", label: { zh: "中等", en: "Moderate" }, desc: { zh: "中等稅率，常見於澳洲、紐西蘭部分稅制。", en: "Moderate rate \u2014 common for Australia and parts of New Zealand." } },
  { key: "std", range: "13–18%", label: { zh: "標準", en: "Standard" }, desc: { zh: "標準稅率，常見於紐西蘭 15%、印度標準 GST。", en: "Standard rate \u2014 common for New Zealand 15% and India\u2019s standard GST." } },
  { key: "high", range: "19–25%", label: { zh: "高稅率", en: "High rate" }, desc: { zh: "高稅率，常見於歐洲多國 VAT 等值稅制。", en: "High rate \u2014 common for many European VAT-equivalent systems." } },
  { key: "vhigh", range: ">25%", label: { zh: "極高", en: "Very high" }, desc: { zh: "極高稅率，常見於北歐 VAT 或特定商品加成。", en: "Very high rate \u2014 common for Nordic VAT or specific surcharged goods." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/finance/percentage-calculator" },
  { label: { zh: "加密貨幣獲利計算機", en: "Crypto Profit Calculator" }, href: "/tools/finance/crypto-profit-calculator" },
  { label: { zh: "彩票稅後實得計算機", en: "Lottery Tax Calculator" }, href: "/tools/finance/lottery-tax-calculator" },
  { label: { zh: "即時匯率查詢器", en: "Currency Exchange Rate" }, href: "/tools/finance/currency-exchange-rate" },
];

const ui = {
  zh: {
    badge: "財務 · GST/消費稅換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "GST Calculator · GST 多國稅率計算機", subtitle: "一站算出含稅、不含稅與稅額",
    intro: "本工具依輸入的金額與 GST／消費稅率，立即算出「加稅後含稅金額」、「從含稅反推不含稅金額」與「稅額」，支援澳洲、紐西蘭、加拿大、新加坡等多國常見稅率，協助商家與消費者快速對帳。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅做單一稅率 GST 換算；不含進項稅扣抵、零稅率、免稅項目或地方附加稅，實際報稅請以當地稅務規定與專業意見為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 GST 範例", examplePreview: "含稅金額預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高稅率範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入金額與稅率", examplesHelper: "先用範例理解 GST 計算，再改成自己的數字與當地稅率。",
    metric: "加稅（不含→含）", imperial: "拆稅（含→不含）", exampleCards: "範例卡", baselineExample: "澳洲 GST · 10%", activeExample: "紐西蘭 GST", flowDemo: "1000 · 10%", calculator: "計算機",
    amountValue: "金額", rateValue: "稅率 (%)", modeHint: "計算方向", presetLabel: "常見稅率",
    resultCard: "GST 計算結果", primaryValue: "主要數值",
    taxAmount: "稅額", inclusive: "含稅金額", exclusive: "不含稅金額", net: "淨額",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格稅率區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將稅率放進常見國別區間；這是換算參考，不是稅務或法律建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 GST 結果轉成可行對帳", conversionNote: "L9 會連動目前計算結果，顯示含稅、不含稅與稅額，協助商家報價、消費者對帳與跨國訂價判讀。",
    progressInsight: "進度洞察卡", possibleTarget: "目前 GST 計算", dailyGap: "含稅金額", weeklyTrend: "稅額", motivation: "動力卡", keepMomentum: "從單筆換算走向穩定對帳",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 GST 計算帶回家", journeyHint: "每次調整金額、稅率或計算方向時重新計算，追蹤含稅與稅額是否符合發票。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用百分比計算機把稅額換算成占總價的比例", nextActionItem2: "用加密貨幣獲利計算機把稅後淨額套用到實際部位", nextActionItem3: "用即時匯率查詢器把含稅金額換成目標幣別",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "GST → 百分比 → 獲利 → 匯率", bmrStep: "GST", deficitStep: "百分比", trendStep: "獲利", mealStep: "匯率",
    knowledge: "知識", knowledgeTitle: "GST／消費稅在財務換算中的意義", definition: "定義", definitionText: "GST（Goods and Services Tax，商品及服務稅）是對商品與服務交易課徵的消費稅，常見於澳洲、紐西蘭、加拿大、新加坡與印度，與歐洲 VAT 概念相近。",
    formula: "公式", formulaText: "含稅金額 = 不含稅金額 × (1 + 稅率 ÷ 100)。不含稅金額 = 含稅金額 ÷ (1 + 稅率 ÷ 100)。稅額 = 含稅金額 − 不含稅金額。",
    limitations: "限制", limitationsText: "本工具只做單一稅率換算；不含進項稅扣抵、混合稅率、零稅率、免稅項目、地方附加稅或匯率波動，正式申報請依當地稅局規定。",
    interpretation: "解讀", interpretationText: "從含稅反推不含稅不是直接乘以稅率，而是除以（1＋稅率）；常見錯誤是把 10% 含稅金額直接乘 0.1 當稅額，會高估稅額。",
    context: "脈絡", contextText: "GST 應搭配計算方向（加稅或拆稅）、適用稅率與是否含稅報價一起看；商家報價與消費者收據的基準不同，容易混淆。",
    example: "範例", exampleText: "不含稅金額 1000、稅率 10%。含稅金額 = 1000 × 1.1 = 1100，稅額 = 100。反向：含稅金額 1100、稅率 10%，不含稅金額 = 1100 ÷ 1.1 = 1000，稅額 = 100。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "GST 換算的下一步工具", premiumTitle: "專業版 GST 工具包", premiumText: "解鎖多稅率切換、進項稅扣抵試算、跨國稅率對照與發票批次換算報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與換算用途，不取代稅務顧問或專業會計建議。", relatedTools: "相關工具", relatedToolsText: "百分比計算機 · 加密貨幣獲利計算機 · 彩票稅後實得計算機 · 即時匯率查詢器", references: "參考資料", referencesText: "澳洲稅務局 ATO GST 指引；紐西蘭 IRD GST 規定；加拿大 CRA GST/HST 資料；新加坡 IRAS GST 稅率公告。",
    q1: "含稅反推不含稅可以直接乘稅率嗎？", a1: "不行。含稅金額 1100 在 10% 稅率下，不含稅金額是 1100 ÷ 1.1 = 1000，稅額 100；若直接乘 0.1 得 110 會高估稅額。",
    q2: "GST 和 VAT 一樣嗎？", a2: "概念相近，都是消費稅，差別在名稱與制度細節。澳洲、紐西蘭、加拿大、新加坡用 GST；歐洲多用 VAT。本工具換算邏輯通用。",
    q3: "為什麼不同國家稅率差很多？", a3: "各國依財政政策設定稅率，新加坡曾為 7–9%、澳洲 10%、紐西蘭 15%、部分歐洲超過 20%。請依交易發生地的適用稅率計算。",
    q4: "商家報價要報含稅還是不含稅？", a4: "視市場慣例與法規。零售面對消費者多採含稅報價（顯示總價），B2B 常採不含稅報價再另加 GST。本工具兩個方向都能算。",
    q5: "進項稅扣抵這個工具能算嗎？", a5: "不能。本工具只算單筆 GST；註冊商家的進項稅扣抵需彙整多筆交易，請使用會計軟體或諮詢稅務顧問。",
    q6: "這個工具能取代正式報稅嗎？", a6: "不能。它只做純換算；正式申報涉及零稅率、免稅、扣抵與申報期等規則，請依當地稅局規定與專業意見辦理。",
  },
  en: {
    badge: "Finance · GST/Sales tax · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "GST Calculator", subtitle: "Find inclusive, exclusive, and tax amounts in one place",
    intro: "This tool instantly computes the tax-inclusive amount, extracts the tax-exclusive amount from an inclusive price, and shows the tax amount \u2014 with common rates for Australia, New Zealand, Canada, Singapore, and more, so merchants and consumers can reconcile fast.",
    trustNoteLabel: "Note:", trustNote: "This tool performs single-rate GST conversion only. It does not handle input-tax credits, zero-rated or exempt items, or local surcharges \u2014 rely on local tax rules and professional advice for filing.",
    quickActionCard: "Quick example", tryExample: "Build a GST example", examplePreview: "Inclusive amount preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-rate example",
    examplesCalculator: "Examples \u2192 Calculator", enterValues: "Enter the amount and rate", examplesHelper: "Start from an example to understand GST math, then change the numbers and rate to match your locale.",
    metric: "Add tax (excl\u2192incl)", imperial: "Extract tax (incl\u2192excl)", exampleCards: "Example cards", baselineExample: "Australia GST \u00b7 10%", activeExample: "New Zealand GST", flowDemo: "1000 \u00b7 10%", calculator: "Calculator",
    amountValue: "Amount", rateValue: "Rate (%)", modeHint: "Calculation direction", presetLabel: "Common rates",
    resultCard: "GST result", primaryValue: "Headline number",
    taxAmount: "Tax amount", inclusive: "Inclusive amount", exclusive: "Exclusive amount", net: "Net",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band rate reading matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 places the rate into common country ranges. This is a conversion reference, not tax or legal advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the GST result into a clear reconciliation", conversionNote: "L9 reflects your current results \u2014 inclusive, exclusive, and tax amount \u2014 to help merchant quoting, consumer reconciliation, and cross-border pricing.",
    progressInsight: "Progress insight", possibleTarget: "Your current GST calc", dailyGap: "Inclusive amount", weeklyTrend: "Tax amount", motivation: "Motivation", keepMomentum: "Move from a one-off conversion to steady reconciliation",
    saveShareJourney: "Save / share", journeyTitle: "Take today\u2019s GST result home", journeyHint: "Recalculate whenever the amount, rate, or direction changes \u2014 and track whether the inclusive and tax amounts match the invoice.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Percentage Calculator to see the tax as a share of the total price", nextActionItem2: "Use Crypto Profit Calculator to apply the net amount to an actual position", nextActionItem3: "Use Currency Exchange Rate to convert the inclusive amount into a target currency",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "GST \u2192 Percentage \u2192 Profit \u2192 Exchange", bmrStep: "GST", deficitStep: "Percentage", trendStep: "Profit", mealStep: "Exchange",
    knowledge: "Knowledge", knowledgeTitle: "What GST/sales tax means in financial conversion", definition: "Definition", definitionText: "GST (Goods and Services Tax) is a consumption tax on goods and services, common in Australia, New Zealand, Canada, Singapore, and India \u2014 conceptually similar to European VAT.",
    formula: "Formula", formulaText: "Inclusive = exclusive \u00d7 (1 + rate \u00f7 100). Exclusive = inclusive \u00f7 (1 + rate \u00f7 100). Tax = inclusive \u2212 exclusive.",
    limitations: "Limitations", limitationsText: "This tool performs single-rate conversion only. It does not handle input-tax credits, mixed rates, zero-rated or exempt items, local surcharges, or exchange-rate swings \u2014 file according to your local tax authority.",
    interpretation: "Interpretation", interpretationText: "Extracting the exclusive amount is not multiplying by the rate but dividing by (1 + rate). A common error is multiplying a 10%-inclusive amount by 0.1 as the tax, which overstates it.",
    context: "Context", contextText: "Read GST together with the direction (add vs extract), the applicable rate, and whether quotes are inclusive \u2014 merchant quotes and consumer receipts use different bases and are easily confused.",
    example: "Example", exampleText: "Exclusive 1000, rate 10%. Inclusive = 1000 \u00d7 1.1 = 1100, tax = 100. Reverse: inclusive 1100 at 10%, exclusive = 1100 \u00f7 1.1 = 1000, tax = 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for GST conversion", premiumTitle: "Pro GST Toolkit", premiumText: "Unlock multi-rate switching, input-tax credit simulation, cross-border rate tables, and batch invoice conversion reports.",
    trustReferences: "Trust \u00b7 Related tools \u00b7 References", trust: "Trust", trustText: "This tool is for educational and conversion purposes only and is not a substitute for tax advisory or professional accounting advice.", relatedTools: "Related tools", relatedToolsText: "Percentage Calculator \u00b7 Crypto Profit Calculator \u00b7 Lottery Tax Calculator \u00b7 Currency Exchange Rate", references: "References", referencesText: "Australian ATO GST guidance; New Zealand IRD GST rules; Canadian CRA GST/HST resources; Singapore IRAS GST rate notices.",
    q1: "Can I multiply an inclusive amount by the rate to get the tax?", a1: "No. For an inclusive 1100 at 10%, the exclusive amount is 1100 \u00f7 1.1 = 1000 and the tax is 100. Multiplying by 0.1 gives 110, overstating the tax.",
    q2: "Are GST and VAT the same?", a2: "They are similar \u2014 both consumption taxes \u2014 differing in name and system details. Australia, NZ, Canada, and Singapore use GST; Europe mostly uses VAT. This tool\u2019s logic is universal.",
    q3: "Why do country rates differ so much?", a3: "Each country sets rates by fiscal policy \u2014 Singapore has ranged 7\u20139%, Australia 10%, New Zealand 15%, and parts of Europe exceed 20%. Use the rate applicable where the transaction occurs.",
    q4: "Should merchants quote inclusive or exclusive prices?", a4: "It depends on market convention and law. Consumer retail often quotes inclusive (showing the total), while B2B often quotes exclusive plus GST. This tool calculates both directions.",
    q5: "Can this tool compute input-tax credits?", a5: "No. It computes single-transaction GST only. Registered merchants\u2019 input-tax credits require aggregating many transactions \u2014 use accounting software or consult a tax advisor.",
    q6: "Can this tool replace official tax filing?", a6: "No. It performs pure conversion only. Official filing involves zero-rated, exempt, credit, and period rules \u2014 follow your local tax authority and professional advice.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function GstCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [amountValue, setAmountValue] = useState("1000");
  const [rateValue, setRateValue] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
    const amount = Number(amountValue) || 0;
    const rate = Number(rateValue) || 0;
    const factor = 1 + rate / 100;
    let exclusive: number, inclusive: number, tax: number;
    if (unit === "metric") {
      // add tax: input is exclusive
      exclusive = amount;
      inclusive = amount * factor;
      tax = inclusive - exclusive;
    } else {
      // extract tax: input is inclusive
      inclusive = amount;
      exclusive = factor !== 0 ? amount / factor : 0;
      tax = inclusive - exclusive;
    }
    return { exclusive, inclusive, tax };
  }, [amountValue, rateValue, unit]);

  const inclusiveDisplay = fmt(result.inclusive, 2);
  const taxDisplay = fmt(result.tax, 2);

  function fillSolid() { setUnit("metric"); setAmountValue("1000"); setRateValue("10"); }
  function fillHigh() { setUnit("imperial"); setAmountValue("1150"); setRateValue("15"); }

  const activeBand = bands.find(b => {
    const r = Number(rateValue) || 0;
    if (r <= 5) return b.key === "low";
    if (r <= 8) return b.key === "sing";
    if (r <= 12) return b.key === "nz";
    if (r <= 18) return b.key === "std";
    if (r <= 25) return b.key === "high";
    return b.key === "vhigh";
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
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{inclusiveDisplay}</div><div className="text-sm font-bold text-indigo-100">{amountValue} · {rateValue}%</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.inclusive}</div><div className="font-black">{inclusiveDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{amountValue} · {rateValue}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.taxAmount}</div><div className="font-black">{taxDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHigh} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">1100</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "不含稅 1000 · 10%" : "Excl 1000 · 10%"}</p></button><button onClick={fillHigh} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">15%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "含稅 1150 · 拆稅" : "Incl 1150 · extract"}</p></button></div><div className="mt-4 rounded-2xl bg-white p-3 text-xs font-black text-slate-500">{t.presetLabel}: 5 · 7 · 8 · 10 · 15 · 20%</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.amountValue}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={amountValue} onChange={(e) => setAmountValue(e.target.value)} /></label><label className="block text-sm font-black text-indigo-700">{t.rateValue}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-indigo-200 px-4 py-3 text-lg font-bold" value={rateValue} onChange={(e) => setRateValue(e.target.value)} /></label><div className="md:col-span-2"><div className="text-sm font-black text-slate-700">{t.modeHint}</div><div className="mt-2 grid grid-cols-2 gap-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{inclusiveDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.inclusive}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.taxAmount}</div><div className="mt-1 text-xl font-black">{taxDisplay}</div><div className="mt-1 text-xs text-slate-300">{rateValue}%</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.exclusive}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "不含稅" : "Excl."}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.exclusive, 2)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "淨額" : "Net"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.taxAmount}</div><div className="mt-1 text-xs font-black text-blue-700">GST</div><p className="mt-2 text-3xl font-black text-blue-950">{taxDisplay}</p><p className="text-sm font-bold text-blue-700">@{rateValue}%</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.inclusive}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "含稅" : "Incl."}</div><p className="mt-2 text-3xl font-black text-slate-950">{inclusiveDisplay}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "總價" : "Total"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="gst-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{taxDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.inclusive}</div><div className="mt-1 text-3xl font-black text-indigo-950">{inclusiveDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.exclusive}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.exclusive, 2)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "GST" : "GST", note: t.bmrStep }, { label: lang === "zh" ? "百分比" : "Percent", note: t.deficitStep }, { label: lang === "zh" ? "獲利" : "Profit", note: t.trendStep }, { label: lang === "zh" ? "匯率" : "Exchange", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="gst-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多稅率", "扣抵", "對照", "報告"] : ["Multi-rate", "Credits", "Tables", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
