// @profile B
// Profile B · 計算機-YMYL · BondYieldCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 1", label: { zh: "極低 (< 1)", en: "Band 1 (< 1)" }, desc: { zh: "落在「極低」級距< 1。YTM < 1%,屬於負實質報酬區(扣通膨後),僅適合避險或現金管理。", en: "Falls in the \"極低\" band < 1. This is the 極低 range for Bond Yield Calculator." } },
  { key: "normal", range: "1–2.5", label: { zh: "低 (1–2.5)", en: "Band 2 (1–2.5)" }, desc: { zh: "落在「低」級距1–2.5。1-2.5%,類似定存利率,適合短期資金停泊與保本配置。", en: "Falls in the \"低\" band 1–2.5. This is the 低 range for Bond Yield Calculator." } },
  { key: "notable", range: "2.5–4", label: { zh: "中等 (2.5–4)", en: "Band 3 (2.5–4)" }, desc: { zh: "落在「中等」級距2.5–4。2.5-4%,屬投資級債券常見區間,可作為平衡型組合的固定收益核心。", en: "Falls in the \"中等\" band 2.5–4. This is the 中等 range for Bond Yield Calculator." } },
  { key: "high", range: "4–6", label: { zh: "良好 (4–6)", en: "Band 4 (4–6)" }, desc: { zh: "落在「良好」級距4–6。4-6%,屬中高評級或長天期公司債常見區間,風險與報酬比合理。", en: "Falls in the \"良好\" band 4–6. This is the 良好 range for Bond Yield Calculator." } },
  { key: "major", range: "6–8", label: { zh: "高 (6–8)", en: "Band 5 (6–8)" }, desc: { zh: "落在「高」級距6–8。6-8%,進入高收益債(垃圾債)或新興市場債區,違約風險上升。", en: "Falls in the \"高\" band 6–8. This is the 高 range for Bond Yield Calculator." } },
  { key: "executive", range: "≥ 8", label: { zh: "極高 (≥ 8)", en: "Band 6 (≥ 8)" }, desc: { zh: "落在「極高」級距≥ 8。> 8%,屬高風險區,可能含信用評級 BB-以下、新興市場、可贖回條款,需仔細評估違約機率。", en: "Falls in the \"極高\" band ≥ 8. This is the 極高 range for Bond Yield Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "稅率級距計算機", en: "Tax Bracket Calculator" }, href: "/tools/finance/tax-bracket-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 債券殖利率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Bond Yield Calculator · 債券殖利率計算機",
    subtitle: "輸入面值、現價、票面利率與剩餘年限，立即估算到期殖利率與當期殖利率",
    intro: "本工具為 債券殖利率計算機，依公開公式於瀏覽器端試算，輸入債券面值、現價、票面利率%、剩餘年限後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算債券殖利率計算機",
    examplePreview: "到期殖利率 (YTM)",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入債券面值、現價、票面利率%、剩餘年限",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "面值 1000 · 現價 950 · 5% · 10 年",
    baselineExampleNote: "債券面值 1000 · 現價 950",
    activeExample: "進階範例",
    activeExampleValue: "面值 1000 · 現價 1080 · 6% · 5 年",
    activeExampleNote: "債券面值 加倍 · 觀察 到期殖利率 (YTM) 變化",
    flowDemo: "數字流向示範",
    calculator: "債券殖利率計算機",
    faceValue: "債券面值",
    currentPrice: "現價",
    couponRatePct: "票面利率%",
    yearsToMaturity: "剩餘年限",
    resultCard: "結果卡片",
    primaryValue: "到期殖利率 (YTM)",
    primaryUnitTail: "%",
    secondaryLabel: "當期殖利率",
    secondaryTail: "%",
    metricALabel: "到期殖利率 (YTM)",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "當期殖利率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "年配息",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "債券殖利率計算機 · 即時試算",
    fatLossTarget: "資本利得",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "債券殖利率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "年配息",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 債券面值 與 票面利率% 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "債券殖利率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 債券面值、現價、票面利率%、剩餘年限 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依面值、現價、票面利率與年限計算當期殖利率、到期殖利率(YTM)、年配息與資本利得。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "債券殖利率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "債券殖利率計算機以面值、現價、票面利率、剩餘年限,計算「到期殖利率(YTM)」與「當期殖利率」,衡量債券的真實年化報酬,適用於公司債、政府債、ETF 內含債券估算。",
    formula: "公式",
    formulaText: "YTM ≈ (年配息 + (面值 − 現價) / 年數) / ((面值 + 現價) / 2);Current Yield = 年配息 / 現價",
    limitations: "限制",
    limitationsText: "本工具用近似公式,不計再投資率、可贖回條款、稅後報酬、信用利差變動;精確 YTM 應用 IRR 求解,實務請查 Bloomberg 或券商系統。",
    interpretation: "解讀",
    interpretationText: "YTM > 當期殖利率 → 折價債(現價 < 面值,賺資本利得);YTM < 當期殖利率 → 溢價債(現價 > 面值,賠資本利得但配息高)。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配投資報酬率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 債券分析工具組",
    premiumText: "解鎖殖利率曲線、存續期間(Duration)、凸性(Convexity)、Yield to Worst、利率敏感度與債券階梯建構。",
    premiumChips_zh: "殖利率曲線|存續期間|凸性|YTW",
    premiumChips_en: "Yield Curve|Duration|Convexity|YTW",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "YTM 和當期殖利率差在哪?哪個重要?",
    a1: "**當期殖利率** = 年配息 / 現價,只看「現在的配息率」,易高估折價債、低估溢價債的真實報酬。**YTM(到期殖利率)** 同時考慮配息與「到期時面值 − 現價」的資本利得/損失,是債券真正的年化報酬率,**做投資決策應以 YTM 為主**。本工具用近似公式估算 YTM,精確值需用 IRR 求解。",
    q2: "為什麼債券價格漲,殖利率反而跌?",
    a2: "因為債券是「鎖定面值與配息」的合約。當市場利率上升,新發行債券更高收益,既有債券若想賣出必須降價以使「降價後的 YTM」與市場新發債等同;反之利率下降,既有債券更值錢。**規則:利率↑ → 價格↓ → YTM↑;利率↓ → 價格↑ → YTM↓**。",
    q3: "美債 10 年期殖利率怎麼看?",
    a3: "美 10 年期公債殖利率(US10Y)被稱為「全球資產定價基準」,用途:**(1) 房貸利率錨**(美國 30 年房貸 ≈ US10Y + 1.5-2%)、**(2) 股市估值錨**(P/E 反向參考 1/US10Y)、**(3) 全球風險偏好指標**(US10Y 上漲 = 風險資產壓力上升)。建議定期觀察 FRED 或 Yahoo Finance 查最新值。",
    q4: "公司債、政府債、高收益債怎麼選?",
    a4: "**政府債(美國公債、台灣公債)**: 信用最高,YTM 最低,適合保本與避險;**投資級公司債(BBB- 以上)**: 信用次高,YTM 高政府債 1-2%,適合穩健投資人;**高收益債(BB+ 以下,垃圾債)**: 違約率 2-10%,YTM 5-15%,屬類股票資產,需高度分散。建議組合:60% 投資級 + 30% 政府債 + 10% 高收益。",
    q5: "債券資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內以 JavaScript 完成,債券面值、現價等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "可以用這個算可贖回債(callable bond)嗎?",
    a6: "**不建議**。可贖回債(callable bond)的真實 YTM 應用「Yield to Worst(YTW)」計算,即「YTM 與 Yield to Call(YTC)取較低者」。本工具只算到期殖利率,可能高估可贖回債的實際報酬。買可贖回債前務必查發行條款的贖回時點與贖回價。"
  },
  en: {
    badge: "Finance · Bond Yield Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Bond Yield Calculator",
    subtitle: "Enter face value, current price, coupon rate, and years to maturity to estimate YTM and current yield",
    intro: "Bond Yield Calculator runs the standard formula in your browser. Enter face value, current price, coupon rate pct, years to maturity to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Bond Yield Calculator",
    examplePreview: "Yield to Maturity",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter face value, current price, coupon rate pct, years to maturity",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "FV 1000 · P 950 · 5% · 10y",
    baselineExampleNote: "Face Value 1000 · Current Price 950",
    activeExample: "Advanced example",
    activeExampleValue: "FV 1000 · P 1080 · 6% · 5y",
    activeExampleNote: "Face Value doubled · watch Yield to Maturity react",
    flowDemo: "Data flow demo",
    calculator: "Bond Yield Calculator",
    faceValue: "Face Value",
    currentPrice: "Current Price",
    couponRatePct: "Coupon Rate Pct",
    yearsToMaturity: "Years To Maturity",
    resultCard: "Result card",
    primaryValue: "Yield to Maturity",
    primaryUnitTail: "%",
    secondaryLabel: "Current Yield",
    secondaryTail: "%",
    metricALabel: "Yield to Maturity",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Current Yield",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Annual Coupon",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Bond Yield Calculator · live calc",
    fatLossTarget: "Capital Gain",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Bond Yield Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Annual Coupon",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Face Value and Coupon Rate Pct by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Bond Yield Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill face value, current price, coupon rate pct, years to maturity.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Bond Yield Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Bond Yield Calculator · concept primer",
    definition: "Definition",
    definitionText: "Bond Yield Calculator converts inputs (face value, current price, coupon rate pct, years to maturity) into Yield to Maturity. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(face value, current price, coupon rate pct, years to maturity)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Investment Return Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Bond Analytics Suite",
    premiumText: "Unlock yield curve, duration, convexity, yield-to-worst, rate sensitivity, and bond-ladder construction.",
    premiumChips_zh: "殖利率曲線|存續期間|凸性|YTW",
    premiumChips_en: "Yield Curve|Duration|Convexity|YTW",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Bond Yield Calculator calculate?",
    a1: "Bond Yield Calculator applies the standard formula to your inputs and returns Yield to Maturity plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Bond Yield Calculator?",
    a2: "Enter face value, current price, coupon rate pct, years to maturity. Bond Yield Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock yield curve, duration, convexity, yield-to-worst, rate sensitivity, and bond-ladder construction."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BondYieldCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [faceValue, setFaceValue] = useState("1000");
  const [currentPrice, setCurrentPrice] = useState("950");
  const [couponRatePct, setCouponRatePct] = useState("5");
  const [yearsToMaturity, setYearsToMaturity] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
    const F = Number(faceValue) || 1000;
    const P = Number(currentPrice) || 1000;
    const c = (Number(couponRatePct) || 0) / 100;
    const n = Number(yearsToMaturity) || 1;
    const annualCoupon = F * c;
    const currentYield = P > 0 ? (annualCoupon / P) * 100 : 0;
    const ytm = n > 0 ? ((annualCoupon + (F - P) / n) / ((F + P) / 2)) * 100 : 0;
    const capitalGain = F - P;
    return { ytm, currentYield, annualCoupon, capitalGain };
  }, [faceValue, currentPrice, couponRatePct, yearsToMaturity]);

  const primaryDisplay = fmt(result.ytm, 2);
  const secondaryDisplay = fmt(result.currentYield, 2);
  const tertiaryDisplay = fmt(result.annualCoupon, 2);
  const quaternaryDisplay = fmt(result.capitalGain, 2);

  function fillSolid() { setUnit("metric"); setFaceValue("1000"); setCurrentPrice("950"); setCouponRatePct("5"); setYearsToMaturity("10"); }
  function fillHighSalary() { setUnit("imperial"); setFaceValue("1000"); setCurrentPrice("1080"); setCouponRatePct("6"); setYearsToMaturity("5"); }

  const activeBand = bands.find(b => {
    const r = result.ytm;
    if (r < 1) return 'tiny';
    if (r < 2.5) return 'normal';
    if (r < 4) return 'notable';
    if (r < 6) return 'high';
    if (r < 8) return 'major';
    return 'executive';
  });

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-amber-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{faceValue} × {currentPrice}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.faceValue}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={faceValue} onChange={(e) => setFaceValue(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.currentPrice}<input type="number" step="5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.couponRatePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={couponRatePct} onChange={(e) => setCouponRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.yearsToMaturity}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={yearsToMaturity} onChange={(e) => setYearsToMaturity(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="bond-yield-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-amber-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="bond-yield-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
