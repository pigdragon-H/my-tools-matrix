// @profile B
// Profile B · 計算機-YMYL · LtvCacRatioCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "嚴重虧損 (< 0)", en: "Loss-making (< 0)" }, desc: { zh: "落在「嚴重虧損」級距< 0。LTV/CAC 小於 1,獲取每位顧客的成本高於其終身價值,商業模式正在虧損,須立即降低 CAC 或提升 LTV。", en: "Falls in the \"Loss-making\" band (< 0). LTV/CAC below 1; acquiring a customer costs more than their lifetime value — the model is losing money." } },
  { key: "normal", range: "0–1", label: { zh: "不健康 (0–1)", en: "Unhealthy (0–1)" }, desc: { zh: "落在「不健康」級距0–1。LTV/CAC 偏低,單位經濟尚未健康,行銷投入回收困難,須優化轉換與留存。", en: "Falls in the \"Unhealthy\" band (0–1). Low LTV/CAC; unit economics are unhealthy and acquisition spend is hard to recoup." } },
  { key: "notable", range: "1–3", label: { zh: "勉強及格 (1–3)", en: "Marginal (1–3)" }, desc: { zh: "落在「勉強及格」級距1–3。LTV/CAC 約在及格邊緣,接近業界常用的 3 倍門檻,仍有改善空間。", en: "Falls in the \"Marginal\" band (1–3). Marginal LTV/CAC near the common 3x benchmark; there is still room to improve." } },
  { key: "high", range: "3–5", label: { zh: "健康 (3–5)", en: "Healthy (3–5)" }, desc: { zh: "落在「健康」級距3–5。LTV/CAC 達 3 倍以上,屬健康的 SaaS 單位經濟,每元獲客成本可換得數倍終身價值。", en: "Falls in the \"Healthy\" band (3–5). LTV/CAC at 3x or above; healthy SaaS unit economics returning several times the acquisition cost." } },
  { key: "major", range: "5–7", label: { zh: "優異 (5–7)", en: "Excellent (5–7)" }, desc: { zh: "落在「優異」級距5–7。LTV/CAC 達 5 倍以上,單位經濟非常健康,可考慮加大行銷投入加速成長。", en: "Falls in the \"Excellent\" band (5–7). LTV/CAC at 5x or above; very healthy economics — consider scaling marketing to grow faster." } },
  { key: "executive", range: "≥ 7", label: { zh: "可能投資不足 (≥ 7)", en: "Underinvesting (≥ 7)" }, desc: { zh: "落在「可能投資不足」級距≥ 7。LTV/CAC 過高(>7),可能代表行銷投入不足,錯失加速成長的機會,可評估擴大獲客。", en: "Falls in the \"Underinvesting\" band (≥ 7). LTV/CAC above 7x may signal underinvesting in growth; consider expanding acquisition." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "SaaS 指標計算機", en: "SaaS Metrics Calculator" }, href: "/tools/finance/saas-metrics-calculator" },
  { label: { zh: "新創燒錢跑道計算機", en: "Startup Runway Calculator" }, href: "/tools/finance/startup-runway-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
  { label: { zh: "損益兩平點計算機", en: "Break-Even Point Calculator" }, href: "/tools/finance/break-even-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · LTV/CAC 比率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "LTV/CAC Ratio Calculator · LTV/CAC 比率計算機",
    subtitle: "由收入、毛利與流失率計算顧客終身價值與 LTV/CAC 比率。",
    intro: "本工具為 LTV/CAC 比率計算機，依公開公式於瀏覽器端試算，輸入每用戶月經常性收入、毛利率(%)、月流失率(%)、顧客取得成本後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算LTV/CAC 比率計算機",
    examplePreview: "LTV/CAC 比率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入每用戶月經常性收入、毛利率(%)、月流失率(%)、顧客取得成本",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "一般 SaaS 情境",
    baselineExampleNote: "每用戶月經常性收入 50 · 毛利率(%) 80",
    activeExample: "進階範例",
    activeExampleValue: "高留存 SaaS 情境",
    activeExampleNote: "每用戶月經常性收入 加倍 · 觀察 LTV/CAC 比率 變化",
    flowDemo: "數字流向示範",
    calculator: "LTV/CAC 比率計算機",
    monthlyRevenuePerCustomer: "每用戶月經常性收入",
    grossMargin: "毛利率(%)",
    monthlyChurnRate: "月流失率(%)",
    customerAcquisitionCost: "顧客取得成本",
    resultCard: "結果卡片",
    primaryValue: "LTV/CAC 比率",
    primaryUnitTail: "x",
    secondaryLabel: "顧客終身價值(LTV)",
    secondaryTail: "",
    metricALabel: "LTV/CAC 比率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "x",
    metricBLabel: "顧客終身價值(LTV)",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "",
    metricCLabel: "平均顧客壽命",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "月",
    headlineCaption: "LTV/CAC 比率計算機 · 即時試算",
    fatLossTarget: "CAC 回收期",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "LTV/CAC 比率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "平均顧客壽命",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 每用戶月經常性收入 與 月流失率(%) 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "LTV/CAC 比率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 每用戶月經常性收入、毛利率(%)、月流失率(%)、顧客取得成本 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "SaaS unit economics LTV to CAC analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "LTV/CAC 比率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "LTV/CAC 比率計算機以每用戶收入、毛利率與流失率估算顧客終身價值,再與顧客取得成本相除,評估 SaaS 單位經濟的健康度與 CAC 回收期。",
    formula: "公式",
    formulaText: "平均顧客壽命 =1 ÷ 月流失率;LTV = 每用戶收入 × 毛利率 × 顧客壽命;LTV/CAC = LTV ÷ 顧客取得成本。",
    limitations: "限制",
    limitationsText: "本工具以固定毛利率與流失率的簡化模型估算,未計入擴張收入、淨流失、折現率與成本結構變動,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "LTV/CAC 越高代表每元獲客成本換得的終身價值越多;一般以 3 倍為健康門檻,並搭配 CAC 回收期一併評估。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配SaaS 指標計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Unit Economics Pro 進階",
    premiumText: "進階版加入分群 LTV、淨流失與擴張收入、折現 LTV 與多情境單位經濟模型。",
    premiumChips_zh: "分群LTV|淨流失|折現LTV|多情境",
    premiumChips_en: "Cohort LTV|Net churn|Discounted LTV|Scenarios",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "LTV/CAC 比率是什麼?",
    a1: "LTV/CAC 比率是顧客終身價值(LTV)與顧客取得成本(CAC)的比值,是衡量 SaaS 與訂閱制商業模式單位經濟是否健康的核心指標。",
    q2: "這個比率怎麼算?",
    a2: "LTV =每用戶收入 × 毛利率 × 平均顧客壽命(以 1 ÷ 月流失率估算月數);LTV/CAC = LTV ÷ 顧客取得成本。",
    q3: "多少倍才算健康?",
    a3: "業界常以 3 倍為健康門檻:低於 1 代表虧損,1–3 倍偏弱,3 倍以上健康,過高(>7 倍)則可能代表行銷投入不足。",
    q4: "什麼是 CAC 回收期?",
    a4: "CAC 回收期是用每位顧客的毛利攤還獲客成本所需的月數,回收期越短代表現金回收越快、成長越可持續,通常以低於 12 個月為佳。",
    q5: "流失率如何影響 LTV?",
    a5: "月流失率越高,平均顧客壽命越短,LTV 越低;降低流失率能顯著拉長顧客壽命並提升終身價值,是改善單位經濟的關鍵。",
    q6: "這個結果準確嗎?",
    a6: "本工具以固定毛利率與流失率的簡化模型估算,未計入擴張收入、折現與成本變動,僅供概念性參考。"
  },
  en: {
    badge: "Finance · LTV/CAC Ratio Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "LTV/CAC Ratio Calculator",
    subtitle: "Calculate customer lifetime value and the LTV/CAC ratio from revenue, margin and churn.",
    intro: "LTV/CAC Ratio Calculator runs the standard formula in your browser. Enter monthly revenue per customer, gross margin, monthly churn rate, customer acquisition cost to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try LTV/CAC Ratio Calculator",
    examplePreview: "LTV/CAC ratio",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter monthly revenue per customer, gross margin, monthly churn rate, customer acquisition cost",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Typical SaaS case",
    baselineExampleNote: "Monthly revenue per customer 50 · Gross margin 80",
    activeExample: "Advanced example",
    activeExampleValue: "High-retention SaaS case",
    activeExampleNote: "Monthly revenue per customer doubled · watch LTV/CAC ratio react",
    flowDemo: "Data flow demo",
    calculator: "LTV/CAC Ratio Calculator",
    monthlyRevenuePerCustomer: "Monthly revenue per customer",
    grossMargin: "Gross margin",
    monthlyChurnRate: "Monthly churn rate",
    customerAcquisitionCost: "Customer acquisition cost",
    resultCard: "Result card",
    primaryValue: "LTV/CAC ratio",
    primaryUnitTail: "x",
    secondaryLabel: "Customer lifetime value",
    secondaryTail: "",
    metricALabel: "LTV/CAC ratio",
    metricACaption: "Main figure from the standard formula",
    metricATail: "x",
    metricBLabel: "Customer lifetime value",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "",
    metricCLabel: "Average customer lifetime",
    metricCCaption: "Percentage view",
    metricCTail: " mo",
    headlineCaption: "LTV/CAC Ratio Calculator · live calc",
    fatLossTarget: "CAC payback period",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "LTV/CAC Ratio Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Average customer lifetime",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Monthly revenue per customer and Monthly churn rate by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "LTV/CAC Ratio Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill monthly revenue per customer, gross margin, monthly churn rate, customer acquisition cost.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "LTV/CAC Ratio Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "LTV/CAC Ratio Calculator · concept primer",
    definition: "Definition",
    definitionText: "LTV/CAC Ratio Calculator converts inputs (monthly revenue per customer, gross margin, monthly churn rate, customer acquisition cost) into LTV/CAC ratio. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(monthly revenue per customer, gross margin, monthly churn rate, customer acquisition cost)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with SaaS Metrics Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Unit Economics Pro",
    premiumText: "Pro adds cohort LTV, net revenue retention, discounted LTV and multi-scenario unit-economics modeling.",
    premiumChips_zh: "分群LTV|淨流失|折現LTV|多情境",
    premiumChips_en: "Cohort LTV|Net churn|Discounted LTV|Scenarios",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does LTV/CAC Ratio Calculator calculate?",
    a1: "LTV/CAC Ratio Calculator applies the standard formula to your inputs and returns LTV/CAC ratio plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for LTV/CAC Ratio Calculator?",
    a2: "Enter monthly revenue per customer, gross margin, monthly churn rate, customer acquisition cost. LTV/CAC Ratio Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds cohort LTV, net revenue retention, discounted LTV and multi-scenario unit-economics modeling."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function LtvCacRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [monthlyRevenuePerCustomer, setMonthlyRevenuePerCustomer] = useState("50");
  const [grossMargin, setGrossMargin] = useState("80");
  const [monthlyChurnRate, setMonthlyChurnRate] = useState("3");
  const [customerAcquisitionCost, setCustomerAcquisitionCost] = useState("400");
  const t = ui[lang];

  const result = useMemo(() => {
const arpu = Number(monthlyRevenuePerCustomer) || 0; const margin = Number(grossMargin) || 0; const churn = Number(monthlyChurnRate) || 0; const cac = Number(customerAcquisitionCost) || 0; const lifetimeMonths = churn > 0 ? 100 / churn : 0; const ltv = arpu * (margin / 100) * lifetimeMonths; const ratio = cac > 0 ? ltv / cac : 0; const paybackMonths = (arpu * margin / 100) > 0 ? cac / (arpu * margin / 100) : 0; return { primaryKey: ratio, secondaryKey: ltv, tertiaryKey: lifetimeMonths, quaternaryKey: paybackMonths };
  }, [monthlyRevenuePerCustomer, grossMargin, monthlyChurnRate, customerAcquisitionCost]);

  const primaryDisplay = fmt(result.primaryKey, 2);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 1);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setMonthlyRevenuePerCustomer("50"); setGrossMargin("80"); setMonthlyChurnRate("3"); setCustomerAcquisitionCost("400"); }
  function fillHighSalary() { setUnit("imperial"); setMonthlyRevenuePerCustomer("80"); setGrossMargin("85"); setMonthlyChurnRate("2"); setCustomerAcquisitionCost("500"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 1) return 'normal';
    if (r < 3) return 'notable';
    if (r < 5) return 'high';
    if (r < 7) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#d1fae5,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-emerald-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{monthlyRevenuePerCustomer} × {grossMargin}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.monthlyRevenuePerCustomer}<input type="number" step="5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyRevenuePerCustomer} onChange={(e) => setMonthlyRevenuePerCustomer(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.grossMargin}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={grossMargin} onChange={(e) => setGrossMargin(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyChurnRate}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyChurnRate} onChange={(e) => setMonthlyChurnRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.customerAcquisitionCost}<input type="number" step="50" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={customerAcquisitionCost} onChange={(e) => setCustomerAcquisitionCost(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ltv-cac-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ltv-cac-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
