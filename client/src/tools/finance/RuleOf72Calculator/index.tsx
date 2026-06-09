// @profile B
// Profile B · 計算機-YMYL · RuleOf72Calculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "翻倍極快 (< 0)", en: "Very fast (< 0)" }, desc: { zh: "落在「翻倍極快」級距< 0。翻倍年數極短,報酬率很高,但通常伴隨高風險,須評估報酬可持續性。", en: "Falls in the \"Very fast\" band (< 0). Very short doubling time from a high return, usually with high risk — assess sustainability." } },
  { key: "normal", range: "0–6", label: { zh: "翻倍很快 (0–6)", en: "Fast (0–6)" }, desc: { zh: "落在「翻倍很快」級距0–6。翻倍年數短,報酬率偏高,複利累積速度快,仍須留意風險。", en: "Falls in the \"Fast\" band (0–6). Short doubling time from a higher return; compounding accumulates fast but watch risk." } },
  { key: "notable", range: "6–9", label: { zh: "翻倍偏快 (6–9)", en: "Fairly fast (6–9)" }, desc: { zh: "落在「翻倍偏快」級距6–9。翻倍年數偏短,報酬率良好,長期複利成長相當有效率。", en: "Falls in the \"Fairly fast\" band (6–9). Fairly short doubling time from a solid return; long-term compounding is efficient." } },
  { key: "high", range: "9–12", label: { zh: "翻倍中等 (9–12)", en: "Moderate (9–12)" }, desc: { zh: "落在「翻倍中等」級距9–12。翻倍年數中等,屬常見的長期投資報酬區間,穩健累積資產。", en: "Falls in the \"Moderate\" band (9–12). Moderate doubling time in the common long-term return range; steady accumulation." } },
  { key: "major", range: "12–18", label: { zh: "翻倍偏慢 (12–18)", en: "Slow (12–18)" }, desc: { zh: "落在「翻倍偏慢」級距12–18。翻倍年數偏長,報酬率偏低,複利效果需要更長時間才顯現。", en: "Falls in the \"Slow\" band (12–18). Long doubling time from a low return; compounding takes longer to show." } },
  { key: "executive", range: "≥ 18", label: { zh: "翻倍很慢 (≥ 18)", en: "Very slow (≥ 18)" }, desc: { zh: "落在「翻倍很慢」級距≥ 18。翻倍年數很長,報酬率低,資產增值緩慢,須留意是否跑贏通膨。", en: "Falls in the \"Very slow\" band (≥ 18). Very long doubling time from a low return; slow growth — check if it beats inflation." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "定期定額投資計算機", en: "Dollar-Cost Averaging Calculator" }, href: "/tools/finance/dollar-cost-averaging" },
  { label: { zh: "實質報酬率計算機", en: "Real Return Calculator" }, href: "/tools/finance/real-return-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 72 法則計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Rule of 72 Calculator · 72 法則計算機",
    subtitle: "由年報酬率快速估算投資翻倍與達標所需的年數。",
    intro: "本工具為 72 法則計算機，依公開公式於瀏覽器端試算，輸入年報酬率(%)、目前投資金額、目標倍數、規則常數(72/70/69.3)後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算72 法則計算機",
    examplePreview: "72法則翻倍年數",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入年報酬率(%)、目前投資金額、目標倍數、規則常數(72/70/69.3)",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "8%翻倍情境",
    baselineExampleNote: "年報酬率(%) 8 · 目前投資金額 100000",
    activeExample: "進階範例",
    activeExampleValue: "12%翻三倍情境",
    activeExampleNote: "年報酬率(%) 加倍 · 觀察 72法則翻倍年數 變化",
    flowDemo: "數字流向示範",
    calculator: "72 法則計算機",
    annualReturnRate: "年報酬率(%)",
    currentInvestmentAmount: "目前投資金額",
    targetMultiple: "目標倍數",
    ruleConstant: "規則常數(72/70/69.3)",
    resultCard: "結果卡片",
    primaryValue: "72法則翻倍年數",
    primaryUnitTail: "年",
    secondaryLabel: "精確翻倍年數",
    secondaryTail: "年",
    metricALabel: "72法則翻倍年數",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "年",
    metricBLabel: "精確翻倍年數",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "年",
    metricCLabel: "達目標倍數年數",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "年",
    headlineCaption: "72 法則計算機 · 即時試算",
    fatLossTarget: "目標金額",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "72 法則計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "達目標倍數年數",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 年報酬率(%) 與 目標倍數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "72 法則計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 年報酬率(%)、目前投資金額、目標倍數、規則常數(72/70/69.3) 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Doubling time estimation analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "72 法則計算機 · 觀念整理",
    definition: "定義",
    definitionText: "72 法則計算機以年報酬率快速估算投資翻倍所需年數,並以精確對數公式計算翻倍與達成任意目標倍數的年數,對照兩種方法的差異。",
    formula: "公式",
    formulaText: "翻倍年數 ≈ 規則常數 ÷ 年報酬率;精確翻倍年數 = ln(2) ÷ ln(1 + 報酬率);達目標倍數年數 = ln(倍數) ÷ ln(1 + 報酬率)。",
    limitations: "限制",
    limitationsText: "本工具假設報酬率固定且每期複利,72 法則為近似值,未計入市場波動、費用、稅負與通膨,實際翻倍時間會有差異,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "翻倍年數越短代表複利累積越快;72 法則便於心算,精確公式更適合極端報酬率,兩者並列可看出估算誤差。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配複利計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Rule of 72 Pro 進階",
    premiumText: "進階版加入動態報酬情境、通膨調整翻倍年數、多資產對照與長期複利曲線視覺化。",
    premiumChips_zh: "動態報酬|通膨調整|多資產對照|複利曲線",
    premiumChips_en: "Dynamic return|Inflation-adj|Multi-asset|Compounding curve",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "72 法則是什麼?",
    a1: "72 法則是估算投資翻倍所需年數的快速心算法:用 72 除以年報酬率(百分比),即可得出資產翻一倍大約要幾年。",
    q2: "72 法則怎麼用?",
    a2: "把年報酬率(以百分比數值)代入,翻倍年數 ≈ 72 ÷ 報酬率;例如年報酬 8%,約需 72 ÷ 8 = 9 年翻倍。",
    q3: "為什麼是 72?",
    a3: "72 是因為它接近 ln(2) × 100 ≈ 69.3,且 72 有許多因數(便於心算),在常見報酬率區間誤差很小,因此被廣泛採用。",
    q4: "72 法則準確嗎?",
    a4: "在約 6%–10% 的報酬率區間,72 法則與精確公式誤差通常在 ±0.2 年內;報酬率極高或極低時,改用 69.3 或 70 會更準確。",
    q5: "可以算其他倍數嗎?",
    a5: "可以,本工具同時以精確對數公式計算達到任意目標倍數所需年數,72 法則僅適用於估算翻一倍。",
    q6: "這個結果準確嗎?",
    a6: "72 法則為快速估算,精確翻倍年數以對數公式計算;本工具假設報酬率固定且連續複利,未計入波動、費用與稅負,僅供概念性參考。"
  },
  en: {
    badge: "Finance · Rule of 72 Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Rule of 72 Calculator",
    subtitle: "Quickly estimate the years to double or reach a target from the annual return rate.",
    intro: "Rule of 72 Calculator runs the standard formula in your browser. Enter annual return rate, current investment amount, target multiple, rule constant to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Rule of 72 Calculator",
    examplePreview: "Years to double (rule)",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter annual return rate, current investment amount, target multiple, rule constant",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "8% doubling case",
    baselineExampleNote: "Annual return rate 8 · Current investment amount 100000",
    activeExample: "Advanced example",
    activeExampleValue: "12% triple case",
    activeExampleNote: "Annual return rate doubled · watch Years to double (rule) react",
    flowDemo: "Data flow demo",
    calculator: "Rule of 72 Calculator",
    annualReturnRate: "Annual return rate",
    currentInvestmentAmount: "Current investment amount",
    targetMultiple: "Target multiple",
    ruleConstant: "Rule constant",
    resultCard: "Result card",
    primaryValue: "Years to double (rule)",
    primaryUnitTail: " yr",
    secondaryLabel: "Exact years to double",
    secondaryTail: " yr",
    metricALabel: "Years to double (rule)",
    metricACaption: "Main figure from the standard formula",
    metricATail: " yr",
    metricBLabel: "Exact years to double",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: " yr",
    metricCLabel: "Years to target multiple",
    metricCCaption: "Percentage view",
    metricCTail: " yr",
    headlineCaption: "Rule of 72 Calculator · live calc",
    fatLossTarget: "Target amount",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Rule of 72 Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Years to target multiple",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Annual return rate and Target multiple by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Rule of 72 Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill annual return rate, current investment amount, target multiple, rule constant.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Rule of 72 Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Rule of 72 Calculator · concept primer",
    definition: "Definition",
    definitionText: "Rule of 72 Calculator converts inputs (annual return rate, current investment amount, target multiple, rule constant) into Years to double (rule). It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(annual return rate, current investment amount, target multiple, rule constant)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Compound Interest Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Rule of 72 Pro",
    premiumText: "Pro adds dynamic return scenarios, inflation-adjusted doubling time, multi-asset comparison and long-term compounding curves.",
    premiumChips_zh: "動態報酬|通膨調整|多資產對照|複利曲線",
    premiumChips_en: "Dynamic return|Inflation-adj|Multi-asset|Compounding curve",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Rule of 72 Calculator calculate?",
    a1: "Rule of 72 Calculator applies the standard formula to your inputs and returns Years to double (rule) plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Rule of 72 Calculator?",
    a2: "Enter annual return rate, current investment amount, target multiple, rule constant. Rule of 72 Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds dynamic return scenarios, inflation-adjusted doubling time, multi-asset comparison and long-term compounding curves."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function RuleOf72Calculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [annualReturnRate, setAnnualReturnRate] = useState("8");
  const [currentInvestmentAmount, setCurrentInvestmentAmount] = useState("100000");
  const [targetMultiple, setTargetMultiple] = useState("2");
  const [ruleConstant, setRuleConstant] = useState("72");
  const t = ui[lang];

  const result = useMemo(() => {
const rate = Number(annualReturnRate) || 0; const amount = Number(currentInvestmentAmount) || 0; const multiple = Number(targetMultiple) || 2; const constant = Number(ruleConstant) || 72; const yearsToDouble = rate > 0 ? constant / rate : 0; const exactDouble = rate > 0 ? Math.log(2) / Math.log(1 + rate / 100) : 0; const yearsToTarget = rate > 0 && multiple > 0 ? Math.log(multiple) / Math.log(1 + rate / 100) : 0; const targetValue = amount * multiple; return { primaryKey: yearsToDouble, secondaryKey: exactDouble, tertiaryKey: yearsToTarget, quaternaryKey: targetValue };
  }, [annualReturnRate, currentInvestmentAmount, targetMultiple, ruleConstant]);

  const primaryDisplay = fmt(result.primaryKey, 1);
  const secondaryDisplay = fmt(result.secondaryKey, 1);
  const tertiaryDisplay = fmt(result.tertiaryKey, 1);
  const quaternaryDisplay = fmt(result.quaternaryKey, 0);

  function fillSolid() { setUnit("metric"); setAnnualReturnRate("8"); setCurrentInvestmentAmount("100000"); setTargetMultiple("2"); setRuleConstant("72"); }
  function fillHighSalary() { setUnit("imperial"); setAnnualReturnRate("12"); setCurrentInvestmentAmount("100000"); setTargetMultiple("3"); setRuleConstant("72"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 6) return 'normal';
    if (r < 9) return 'notable';
    if (r < 12) return 'high';
    if (r < 18) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-sky-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-sky-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-sky-100 bg-white/90 p-6 shadow-2xl shadow-sky-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-sky-600 p-5 text-white"><div className="text-xs font-bold uppercase text-sky-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-sky-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{annualReturnRate} × {currentInvestmentAmount}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-black text-sky-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.annualReturnRate}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={annualReturnRate} onChange={(e) => setAnnualReturnRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentInvestmentAmount}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentInvestmentAmount} onChange={(e) => setCurrentInvestmentAmount(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetMultiple}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetMultiple} onChange={(e) => setTargetMultiple(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.ruleConstant}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={ruleConstant} onChange={(e) => setRuleConstant(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-sky-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-sky-400 bg-sky-50 ring-2 ring-sky-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="rule-of-72-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-sky-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-sky-50 p-4"><div className="text-xs font-black uppercase text-sky-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-sky-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-sky-300 bg-sky-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="rule-of-72-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-center font-black text-sky-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-sky-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
