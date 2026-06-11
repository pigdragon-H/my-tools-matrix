// @profile B
// Profile B · 計算機-YMYL · SocialSecurityCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< -25", label: { zh: "大幅減額 (< -25)", en: "Deep reduction (< -25)" }, desc: { zh: "落在「大幅減額」級距< -25。提早請領造成大幅永久減額,適合急需現金流或健康因素者。", en: "Falls in the \"Deep reduction\" band (< -25). Early claiming causes a deep permanent reduction; suits urgent cash-flow or health needs." } },
  { key: "normal", range: "-25–-10", label: { zh: "減額請領 (-25–-10)", en: "Reduced claim (-25–-10)" }, desc: { zh: "落在「減額請領」級距-25–-10。提早請領有減額,但提前領取年數可彌補部分總額。", en: "Falls in the \"Reduced claim\" band (-25–-10). Early claiming is reduced, but extra years of payments may offset some of the total." } },
  { key: "notable", range: "-10–0", label: { zh: "接近全額 (-10–0)", en: "Near full (-10–0)" }, desc: { zh: "落在「接近全額」級距-10–0。接近 FRA,給付接近全額,減額幅度有限。", en: "Falls in the \"Near full\" band (-10–0). Near FRA; benefit is close to full with limited reduction." } },
  { key: "high", range: "0–8", label: { zh: "全額 FRA (0–8)", en: "Full FRA (0–8)" }, desc: { zh: "落在「全額 FRA」級距0–8。於 FRA 請領可獲全額給付,為標準基準點。", en: "Falls in the \"Full FRA\" band (0–8). Claiming at FRA yields the full benefit — the standard baseline." } },
  { key: "major", range: "8–16", label: { zh: "延後增額 (8–16)", en: "Delayed boost (8–16)" }, desc: { zh: "落在「延後增額」級距8–16。延後請領可獲延遲退休點數,給付永久增加。", en: "Falls in the \"Delayed boost\" band (8–16). Delaying earns delayed-retirement credits, permanently raising the benefit." } },
  { key: "executive", range: "≥ 16", label: { zh: "最大增額 (≥ 16)", en: "Maximum boost (≥ 16)" }, desc: { zh: "落在「最大增額」級距≥ 16。延後至上限可獲最大增額,適合長壽預期者。", en: "Falls in the \"Maximum boost\" band (≥ 16). Delaying to the cap earns the maximum boost; suits those expecting longevity." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "FIRE 目標計算機", en: "FIRE Number Calculator" }, href: "/tools/finance/fire-number-calculator" },
  { label: { zh: "提領率計算機", en: "Withdrawal Rate Calculator" }, href: "/tools/finance/withdrawal-rate-calculator" },
  { label: { zh: "401k 計算機", en: "401k Calculator" }, href: "/tools/finance/retirement-401k-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 社會安全退休金估算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Social Security Calculator · 社會安全退休金估算機",
    subtitle: "依提早或延後請領規則,估算社會安全退休金的月給付與長期累計。",
    intro: "本工具為 社會安全退休金估算機，依公開公式於瀏覽器端試算，輸入FRA 全額月給付、計畫請領年齡、完全退休年齡FRA、預期通膨調整後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算社會安全退休金估算機",
    examplePreview: "預估每月給付",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入FRA 全額月給付、計畫請領年齡、完全退休年齡FRA、預期通膨調整",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "FRA 全額請領",
    baselineExampleNote: "FRA 全額月給付 2400 · 計畫請領年齡 67",
    activeExample: "進階範例",
    activeExampleValue: "延後至 70 歲",
    activeExampleNote: "FRA 全額月給付 加倍 · 觀察 預估每月給付 變化",
    flowDemo: "數字流向示範",
    calculator: "社會安全退休金估算機",
    fullMonthlyBenefitAtFra: "FRA 全額月給付",
    plannedClaimingAge: "計畫請領年齡",
    fullRetirementAgeFra: "完全退休年齡FRA",
    annualColaAdjustment: "預期通膨調整",
    resultCard: "結果卡片",
    primaryValue: "預估每月給付",
    primaryUnitTail: "$",
    secondaryLabel: "預估年度給付",
    secondaryTail: "$",
    metricALabel: "預估每月給付",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "預估年度給付",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "相對 FRA 調整幅度",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "社會安全退休金估算機 · 即時試算",
    fatLossTarget: "至 85 歲累計給付",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "社會安全退休金估算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "相對 FRA 調整幅度",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 FRA 全額月給付 與 完全退休年齡FRA 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "社會安全退休金估算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 FRA 全額月給付、計畫請領年齡、完全退休年齡FRA、預期通膨調整 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Social Security benefit by claiming age。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "社會安全退休金估算機 · 觀念整理",
    definition: "定義",
    definitionText: "社會安全退休金估算機依您的 FRA 全額給付(PIA)與計畫請領年齡,套用提早減額或延後增額規則,估算每月與年度給付。",
    formula: "公式",
    formulaText: "提早:前 36 月每月 −5/9%、超過每月 −5/12%;延後:每月 +2/3%(每年約 +8%,至 70 歲)。月給付 = PIA × 調整係數。",
    limitations: "限制",
    limitationsText: "本工具為簡化估算,未計入完整收入紀錄、稅負、配偶/遺屬給付與 SSA 實際公式變動,結果僅供規劃參考。",
    interpretation: "解讀",
    interpretationText: "相對 FRA 的調整幅度為正代表延後增額、為負代表提早減額;累計給付協助比較不同請領年齡的長期總額。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配退休計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Social Security Pro 進階",
    premiumText: "進階版加入配偶與遺屬給付、損益平衡分析、稅負估算與多情境請領比較,協助您選出最佳請領時點。",
    premiumChips_zh: "配偶給付|損益平衡|稅負估算|情境比較",
    premiumChips_en: "Spousal|Break-even|Taxation|Scenarios",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "什麼是 FRA 全額給付?",
    a1: "FRA(完全退休年齡)全額給付即 PIA,是您在完全退休年齡請領時可領的基準月給付。",
    q2: "提早請領會減多少?",
    a2: "提早請領時,前 36 個月每月減 5/9%,超過部分每月減 5/12%;最早 62 歲約減 30%。",
    q3: "延後請領能增加多少?",
    a3: "FRA 後每延後一個月增加 2/3%(每年約 8%),最多延後至 70 歲,可增約 24%。",
    q4: "通膨調整 COLA 是什麼?",
    a4: "COLA 為生活成本調整,依通膨每年調升給付;本工具以您輸入的年通膨率作示意。",
    q5: "幾歲請領最划算?",
    a5: "取決於健康、壽命預期與現金流需求;延後請領的損益平衡點通常落在 78–82 歲附近。",
    q6: "這個估算準確嗎?",
    a6: "本工具為簡化估算,實際給付依 SSA 完整公式、收入紀錄與法規而定,僅供規劃參考。"
  },
  en: {
    badge: "Finance · Social Security Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Social Security Calculator",
    subtitle: "Estimate Social Security monthly benefits adjusted for early or delayed claiming.",
    intro: "Social Security Calculator runs the standard formula in your browser. Enter full monthly benefit at fra, planned claiming age, full retirement age fra, annual cola adjustment to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Social Security Calculator",
    examplePreview: "Estimated monthly benefit",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter full monthly benefit at fra, planned claiming age, full retirement age fra, annual cola adjustment",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Full FRA claim",
    baselineExampleNote: "Full monthly benefit at FRA 2400 · Planned claiming age 67",
    activeExample: "Advanced example",
    activeExampleValue: "Delayed to age 70",
    activeExampleNote: "Full monthly benefit at FRA doubled · watch Estimated monthly benefit react",
    flowDemo: "Data flow demo",
    calculator: "Social Security Calculator",
    fullMonthlyBenefitAtFra: "Full monthly benefit at FRA",
    plannedClaimingAge: "Planned claiming age",
    fullRetirementAgeFra: "Full retirement age FRA",
    annualColaAdjustment: "Annual COLA adjustment",
    resultCard: "Result card",
    primaryValue: "Estimated monthly benefit",
    primaryUnitTail: "$",
    secondaryLabel: "Estimated annual benefit",
    secondaryTail: "$",
    metricALabel: "Estimated monthly benefit",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Estimated annual benefit",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Adjustment vs FRA",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Social Security Calculator · live calc",
    fatLossTarget: "Cumulative benefit to age 85",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Social Security Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Adjustment vs FRA",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Full monthly benefit at FRA and Full retirement age FRA by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Social Security Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill full monthly benefit at fra, planned claiming age, full retirement age fra, annual cola adjustment.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Social Security Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Social Security Calculator · concept primer",
    definition: "Definition",
    definitionText: "Social Security Calculator converts inputs (full monthly benefit at fra, planned claiming age, full retirement age fra, annual cola adjustment) into Estimated monthly benefit. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(full monthly benefit at fra, planned claiming age, full retirement age fra, annual cola adjustment)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Retirement Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Social Security Pro",
    premiumText: "Pro adds spousal and survivor benefits, break-even analysis, taxation estimates, and multi-scenario claiming comparison to find your optimal timing.",
    premiumChips_zh: "配偶給付|損益平衡|稅負估算|情境比較",
    premiumChips_en: "Spousal|Break-even|Taxation|Scenarios",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Social Security Calculator calculate?",
    a1: "Social Security Calculator applies the standard formula to your inputs and returns Estimated monthly benefit plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Social Security Calculator?",
    a2: "Enter full monthly benefit at fra, planned claiming age, full retirement age fra, annual cola adjustment. Social Security Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds spousal and survivor benefits, break-even analysis, taxation estimates, and multi-scenario claiming comparison to find your optimal timing."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SocialSecurityCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [fullMonthlyBenefitAtFra, setFullMonthlyBenefitAtFra] = useState("2400");
  const [plannedClaimingAge, setPlannedClaimingAge] = useState("67");
  const [fullRetirementAgeFra, setFullRetirementAgeFra] = useState("67");
  const [annualColaAdjustment, setAnnualColaAdjustment] = useState("2.5");
  const t = ui[lang];

  const result = useMemo(() => {
const pia = Number(fullMonthlyBenefitAtFra) || 0; const claimAge = Number(plannedClaimingAge) || 0; const fra = Number(fullRetirementAgeFra) || 67; const cola = (Number(annualColaAdjustment) || 0) / 100; let factor = 1; if (claimAge < fra) { const monthsEarly = (fra - claimAge) * 12; const first36 = Math.min(monthsEarly, 36); const beyond = Math.max(0, monthsEarly - 36); factor = 1 - (first36 * (5/9/100)) - (beyond * (5/12/100)); } else if (claimAge > fra) { const monthsLate = (claimAge - fra) * 12; factor = 1 + monthsLate * (8/12/100); } if (factor < 0) factor = 0; const monthlyBenefit = pia * factor; const annualBenefit = monthlyBenefit * 12; const adjPct = (factor - 1) * 100; const lifetimeTo85 = annualBenefit * Math.max(0, 85 - claimAge); return { primaryKey: monthlyBenefit, secondaryKey: annualBenefit, tertiaryKey: adjPct, quaternaryKey: lifetimeTo85 };
  }, [fullMonthlyBenefitAtFra, plannedClaimingAge, fullRetirementAgeFra, annualColaAdjustment]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 1);
  const quaternaryDisplay = fmt(result.quaternaryKey, 0);

  function fillSolid() { setUnit("metric"); setFullMonthlyBenefitAtFra("2400"); setPlannedClaimingAge("67"); setFullRetirementAgeFra("67"); setAnnualColaAdjustment("2.5"); }
  function fillHighSalary() { setUnit("imperial"); setFullMonthlyBenefitAtFra("2400"); setPlannedClaimingAge("70"); setFullRetirementAgeFra("67"); setAnnualColaAdjustment("2.5"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < -25) return 'tiny';
    if (r < -10) return 'normal';
    if (r < 0) return 'notable';
    if (r < 8) return 'high';
    if (r < 16) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-blue-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-blue-600 p-5 text-white"><div className="text-xs font-bold uppercase text-blue-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-blue-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fullMonthlyBenefitAtFra} × {plannedClaimingAge}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-black text-blue-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.fullMonthlyBenefitAtFra}<input type="number" step="50" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={fullMonthlyBenefitAtFra} onChange={(e) => setFullMonthlyBenefitAtFra(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.plannedClaimingAge}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={plannedClaimingAge} onChange={(e) => setPlannedClaimingAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.fullRetirementAgeFra}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={fullRetirementAgeFra} onChange={(e) => setFullRetirementAgeFra(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualColaAdjustment}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualColaAdjustment} onChange={(e) => setAnnualColaAdjustment(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-blue-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="social-security-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-blue-300 bg-blue-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="social-security-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center font-black text-blue-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-blue-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
