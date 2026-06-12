// @profile B
// Profile B · 計算機-YMYL · DiscountCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 1", label: { zh: "無折扣 (< 1)", en: "Very low (< 1)" }, desc: { zh: "落在「無折扣」級距< 1。0% 折扣,原價購買,可考慮搭配優惠券或會員價。", en: "Falls in the \"Very low\" band (< 1). This is the very low range for Discount Calculator." } },
  { key: "normal", range: "1–15", label: { zh: "小折 (1–15)", en: "Low (1–15)" }, desc: { zh: "落在「小折」級距1–15。< 15%,小幅折扣,常見於一般促銷或會員小折。", en: "Falls in the \"Low\" band (1–15). This is the low range for Discount Calculator." } },
  { key: "notable", range: "15–30", label: { zh: "中折 (15–30)", en: "Moderate (15–30)" }, desc: { zh: "落在「中折」級距15–30。15-30%,中等折扣,季節性促銷的常見幅度。", en: "Falls in the \"Moderate\" band (15–30). This is the moderate range for Discount Calculator." } },
  { key: "high", range: "30–50", label: { zh: "大折 (30–50)", en: "High (30–50)" }, desc: { zh: "落在「大折」級距30–50。30-50%,大折扣,換季出清或週年慶的吸引力區間。", en: "Falls in the \"High\" band (30–50). This is the high range for Discount Calculator." } },
  { key: "major", range: "50–70", label: { zh: "超殺 (50–70)", en: "Very high (50–70)" }, desc: { zh: "落在「超殺」級距50–70。50-70%,超殺價,通常為清庫存或限時搶購。", en: "Falls in the \"Very high\" band (50–70). This is the very high range for Discount Calculator." } },
  { key: "executive", range: "≥ 70", label: { zh: "出清 (≥ 70)", en: "Extreme (≥ 70)" }, desc: { zh: "落在「出清」級距≥ 70。> 70%,出清等級,務必確認是否為原價灌水後的假折扣。", en: "Falls in the \"Extreme\" band (≥ 70). This is the extreme range for Discount Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "加成計算機", en: "Markup Calculator" }, href: "/tools/finance/markup-calculator" },
  { label: { zh: "銷售稅計算機", en: "Sales Tax Calculator" }, href: "/tools/finance/sales-tax-calculator" },
  { label: { zh: "利潤率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "小費計算機", en: "Tip Calculator" }, href: "/tools/finance/tip-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 折扣計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Discount Calculator · 折扣計算機",
    subtitle: "輸入原價、折扣與數量，立即算出折後單價、總省金額與實際折扣",
    intro: "本工具為 折扣計算機，依公開公式於瀏覽器端試算，輸入原價、折扣百分比%、額外折抵、數量後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算折扣計算機",
    examplePreview: "實際折扣",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入原價、折扣百分比%、額外折抵、數量",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "原價 1000 · 8 折",
    baselineExampleNote: "原價 1000 · 折扣百分比% 20",
    activeExample: "進階範例",
    activeExampleValue: "原價 2500 · 6 折 · 折 200 · 2 件",
    activeExampleNote: "原價 加倍 · 觀察 實際折扣 變化",
    flowDemo: "數字流向示範",
    calculator: "折扣計算機",
    originalPrice: "原價",
    discountPercent: "折扣百分比%",
    extraOff: "額外折抵",
    quantity: "數量",
    resultCard: "結果卡片",
    primaryValue: "實際折扣",
    primaryUnitTail: "%",
    secondaryLabel: "折後單價",
    secondaryTail: "$",
    metricALabel: "實際折扣",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "折後單價",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "最終總額",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "折扣計算機 · 即時試算",
    fatLossTarget: "總共省下",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "折扣計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "最終總額",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 原價 與 額外折抵 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "折扣計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 原價、折扣百分比%、額外折抵、數量 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依原價、折扣百分比、額外折抵與數量計算折後單價、總省金額與最終總額。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "折扣計算機 · 觀念整理",
    definition: "定義",
    definitionText: "折扣計算機以原價、折扣百分比、額外固定折抵與數量,計算折後單價、最終總額、總省金額與實際折扣率,適用購物、促銷比價與報價。",
    formula: "公式",
    formulaText: "折後單價 = 原價 × (1 − 折扣%) − 額外折抵;最終總額 = 折後單價 × 數量;實際折扣% = (原價 − 折後單價) / 原價",
    limitations: "限制",
    limitationsText: "本工具採先百分比後固定折抵的順序,不含稅、運費與多重優惠券疊加規則;實際結帳金額請以商家系統為準。",
    interpretation: "解讀",
    interpretationText: "實際折扣率讓您跨檔比較不同促銷的真實優惠;折後單價可用於與其他通路同品項比價。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配加成計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 購物比價工具組",
    premiumText: "解鎖多通路比價、優惠券疊加模擬、買N送M換算、單位價格比較與歷史價格追蹤。",
    premiumChips_zh: "多通路比價|優惠疊加|買N送M|單位比價",
    premiumChips_en: "Compare|Stacking|BOGO|Unit Price",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "先打折還是先折抵划算?",
    a1: "通常**先按百分比折扣、再扣固定金額折抵**對消費者較有利(本工具預設此順序)。例如原價 1000、打 8 折後 800、再折 100 = 700。若順序相反(先折 100 = 900、再打 8 折 = 720)反而較貴。結帳前留意系統的折抵順序。",
    q2: "買一送一等於幾折?",
    a2: "**買一送一**等於兩件均價 5 折(50% off);**買二送一**等於三件均價約 67 折(33% off);**第二件半價**等於兩件均價 75 折(25% off)。換算成單件實際折扣才能跨檔比較,本工具的「實際折扣」欄位即此用途。",
    q3: "怎麼看穿假折扣?",
    a3: "假折扣手法:**(1) 先抬高原價再打折**、(2) 標示「最高」折扣但僅限少數品項、(3) 加價購門檻。破解方法:查歷史價格(如比價網)、算實際折後單價、比較不同通路同品項,別只看折扣數字。",
    q4: "多重折扣怎麼疊加?",
    a4: "多重折扣是**相乘**而非相加。例如「打 8 折再打 9 折」= 0.8 × 0.9 = 0.72,即實際 72 折(28% off),不是 8+1=9 折也不是 7 折。本工具的百分比折扣與額外折抵可組合計算。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內完成,價格資料不會傳送到任何伺服器。",
    q6: "可以比較多家價格嗎?",
    a6: "多通路比價、優惠券疊加模擬、歷史價格追蹤與單位價格比較屬於專業版功能。"
  },
  en: {
    badge: "Finance · Discount Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Discount Calculator",
    subtitle: "Enter original price, discount, and quantity to compute final price, total savings, and effective discount",
    intro: "Discount Calculator runs the standard formula in your browser. Enter original price, discount percent, extra off, quantity to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Discount Calculator",
    examplePreview: "Effective Discount",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter original price, discount percent, extra off, quantity",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "List 1000 · 20% off",
    baselineExampleNote: "Original Price 1000 · Discount Percent 20",
    activeExample: "Advanced example",
    activeExampleValue: "List 2500 · 40% off · -200 · 2",
    activeExampleNote: "Original Price doubled · watch Effective Discount react",
    flowDemo: "Data flow demo",
    calculator: "Discount Calculator",
    originalPrice: "Original Price",
    discountPercent: "Discount Percent",
    extraOff: "Extra Off",
    quantity: "Quantity",
    resultCard: "Result card",
    primaryValue: "Effective Discount",
    primaryUnitTail: "%",
    secondaryLabel: "Final Unit Price",
    secondaryTail: "$",
    metricALabel: "Effective Discount",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Final Unit Price",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Final Total",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Discount Calculator · live calc",
    fatLossTarget: "Total Saved",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Discount Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Final Total",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Original Price and Extra Off by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Discount Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill original price, discount percent, extra off, quantity.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Discount Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Discount Calculator · concept primer",
    definition: "Definition",
    definitionText: "Discount Calculator converts inputs (original price, discount percent, extra off, quantity) into Effective Discount. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(original price, discount percent, extra off, quantity)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Markup Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Shopping Compare Suite",
    premiumText: "Unlock multi-store compare, coupon stacking, buy-N-get-M conversion, unit pricing, and price history.",
    premiumChips_zh: "多通路比價|優惠疊加|買N送M|單位比價",
    premiumChips_en: "Compare|Stacking|BOGO|Unit Price",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Discount Calculator calculate?",
    a1: "Discount Calculator applies the standard formula to your inputs and returns Effective Discount plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Discount Calculator?",
    a2: "Enter original price, discount percent, extra off, quantity. Discount Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock multi-store compare, coupon stacking, buy-N-get-M conversion, unit pricing, and price history."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function DiscountCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [originalPrice, setOriginalPrice] = useState("1000");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [extraOff, setExtraOff] = useState("0");
  const [quantity, setQuantity] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const price = Number(originalPrice) || 0;
    const disc = (Number(discountPercent) || 0) / 100;
    const extra = Number(extraOff) || 0;
    const qty = Number(quantity) || 1;
    const afterPct = price * (1 - disc);
    const finalUnit = Math.max(0, afterPct - extra);
    const total = finalUnit * qty;
    const saved = (price - finalUnit) * qty;
    const effDisc = price > 0 ? ((price - finalUnit) / price) * 100 : 0;
    return { finalUnit, total, saved, effDisc };
  }, [originalPrice, discountPercent, extraOff, quantity]);

  const primaryDisplay = fmt(result.effDisc, 2);
  const secondaryDisplay = fmt(result.finalUnit, 2);
  const tertiaryDisplay = fmt(result.total, 2);
  const quaternaryDisplay = fmt(result.saved, 2);

  function fillSolid() { setUnit("metric"); setOriginalPrice("1000"); setDiscountPercent("20"); setExtraOff("0"); setQuantity("1"); }
  function fillHighSalary() { setUnit("imperial"); setOriginalPrice("2500"); setDiscountPercent("40"); setExtraOff("200"); setQuantity("2"); }

  const activeBand = bands.find(b => {
    const r = result.effDisc;
    if (r < 1) return 'tiny';
    if (r < 15) return 'normal';
    if (r < 30) return 'notable';
    if (r < 50) return 'high';
    if (r < 70) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_#f8fafc_45%,_#cffafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-teal-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-teal-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-teal-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-teal-600 p-5 text-white"><div className="text-xs font-bold uppercase text-teal-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-teal-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{originalPrice} × {discountPercent}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-sm font-black text-teal-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.originalPrice}<input type="number" step="10" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.discountPercent}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.extraOff}<input type="number" step="10" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={extraOff} onChange={(e) => setExtraOff(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.quantity}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-teal-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-teal-400 bg-teal-50 ring-2 ring-teal-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="discount-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-teal-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-teal-300 bg-teal-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="discount-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-center font-black text-teal-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-teal-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-teal-200 bg-gradient-to-br from-teal-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
