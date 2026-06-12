// @profile B
// Profile B · 計算機-YMYL · RefinanceCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.01", label: { zh: "反而貴 (< 0.01)", en: "Very low (< 0.01)" }, desc: { zh: "落在「反而貴」級距< 0.01。每月省 ≤ 0,新方案反而更貴,通常因延長年限抵銷利率優勢,不建議。", en: "Falls in the \"Very low\" band (< 0.01). This is the very low range for Refinance Calculator." } },
  { key: "normal", range: "0.01–100", label: { zh: "持平 (0.01–100)", en: "Low (0.01–100)" }, desc: { zh: "落在「持平」級距0.01–100。0-100,月省微薄,需確認手續費與閉鎖成本是否值得。", en: "Falls in the \"Low\" band (0.01–100). This is the low range for Refinance Calculator." } },
  { key: "notable", range: "100–300", label: { zh: "小省 (100–300)", en: "Moderate (100–300)" }, desc: { zh: "落在「小省」級距100–300。100-300,小幅節省,計算回本期後再決定。", en: "Falls in the \"Moderate\" band (100–300). This is the moderate range for Refinance Calculator." } },
  { key: "high", range: "300–600", label: { zh: "中省 (300–600)", en: "High (300–600)" }, desc: { zh: "落在「中省」級距300–600。300-600,中等節省,通常值得,留意一次性費用攤回。", en: "Falls in the \"High\" band (300–600). This is the high range for Refinance Calculator." } },
  { key: "major", range: "600–1000", label: { zh: "大省 (600–1000)", en: "Very high (600–1000)" }, desc: { zh: "落在「大省」級距600–1000。600-1000,大幅節省,再融資吸引力高。", en: "Falls in the \"Very high\" band (600–1000). This is the very high range for Refinance Calculator." } },
  { key: "executive", range: "≥ 1000", label: { zh: "超省 (≥ 1000)", en: "Extreme (≥ 1000)" }, desc: { zh: "落在「超省」級距≥ 1000。> 1000,超大節省,強烈建議評估再融資(確認費用後)。", en: "Falls in the \"Extreme\" band (≥ 1000). This is the extreme range for Refinance Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "房貸計算機", en: "Mortgage Calculator" }, href: "/tools/finance/mortgage-calculator" },
  { label: { zh: "攤還排程計算機", en: "Amortization Schedule Calculator" }, href: "/tools/finance/amortization-schedule-calculator" },
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "有效年利率計算機", en: "Effective Annual Rate Calculator" }, href: "/tools/finance/effective-annual-rate-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 再融資計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Refinance Calculator · 再融資計算機",
    subtitle: "輸入剩餘本金、原月付與新方案，立即算出新月付、每月省與全期節省",
    intro: "本工具為 再融資計算機，依公開公式於瀏覽器端試算，輸入剩餘本金、原月付、新年利率%、新年限後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算再融資計算機",
    examplePreview: "每月省",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入剩餘本金、原月付、新年利率%、新年限",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "餘額 40 萬 · 舊月付 2500 · 4% · 20 年",
    baselineExampleNote: "剩餘本金 400000 · 原月付 2500",
    activeExample: "進階範例",
    activeExampleValue: "餘額 60 萬 · 舊月付 3800 · 3.5% · 25 年",
    activeExampleNote: "剩餘本金 加倍 · 觀察 每月省 變化",
    flowDemo: "數字流向示範",
    calculator: "再融資計算機",
    remainingBalance: "剩餘本金",
    currentPayment: "原月付",
    newRatePct: "新年利率%",
    newYears: "新年限",
    resultCard: "結果卡片",
    primaryValue: "每月省",
    primaryUnitTail: "$",
    secondaryLabel: "新月付",
    secondaryTail: "$",
    metricALabel: "每月省",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "新月付",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "新總利息",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "再融資計算機 · 即時試算",
    fatLossTarget: "全期省",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "再融資計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "新總利息",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 剩餘本金 與 新年利率% 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "再融資計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 剩餘本金、原月付、新年利率%、新年限 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依剩餘本金、新利率與新年限計算新月付、月省金額與總利息節省。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "再融資計算機 · 觀念整理",
    definition: "定義",
    definitionText: "再融資計算機以剩餘本金、原月付、新利率與新年限,計算再融資後的新月付、每月節省、新總利息與全期節省,協助判斷房貸或貸款是否值得再融資。",
    formula: "公式",
    formulaText: "新月付 = 餘額 × r / (1 − (1+r)^−n);每月省 = 原月付 − 新月付;全期省 = 每月省 × 新期數(未扣手續費)",
    limitations: "限制",
    limitationsText: "本工具未計再融資手續費、開辦費與提前清償違約金,因此「全期省」為毛節省;務必扣除一次性成本並計算回本期再決定。",
    interpretation: "解讀",
    interpretationText: "每月省為正且能在持有期內回本(一次性成本÷每月省)才值得;留意延長年限可能使總利息不減反增。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配房貸計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 再融資決策工具組",
    premiumText: "解鎖含手續費的回本期、降月付 vs 縮年限情境比較、剩餘利息精算與最佳再融資時機分析。",
    premiumChips_zh: "回本期|情境比較|利息精算|最佳時機",
    premiumChips_en: "Break-even|Scenarios|Exact|Timing",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "什麼時候該再融資?",
    a1: "常見再融資時機:**(1) 市場利率明顯下降**(一般降 0.75-1% 以上才划算)、**(2) 信用評分提升**可拿到更好利率、**(3) 想縮短年限**加速還清、**(4) 浮動轉固定**鎖定利率。關鍵是「省下的利息 > 再融資成本」且能在持有期內回本。",
    q2: "再融資的成本有哪些?",
    a2: "再融資成本包含:**(1) 開辦費/手續費**(常見本金 0.5-2%)、**(2) estimation/鑑價費**、**(3) 代書/過戶費**、**(4) 原貸款提前清償違約金**。把這些一次性成本除以每月省的金額,就是回本月數,超過持有期就不划算。",
    q3: "降月付 vs 省總利息怎麼選?",
    a3: "**降月付**改善現金流(適合手頭緊、想增加投資),但若靠延長年限換來,總利息可能反增;**省總利息**靠降利率或縮年限達成,長期更省但月付可能不降甚至上升。看您重視現金流還是總成本。",
    q4: "延長年限是陷阱嗎?",
    a4: "不一定是陷阱,但要警覺。延長年限(如剩 20 年再融資成 30 年)能大幅降月付,但總利息可能不減反增。聰明做法:**再融資成更低利率,但維持或縮短年限**,才能同時降月付與省總息。本工具讓您試不同年限觀察。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內完成,本金與利率資料不會傳送到任何伺服器。",
    q6: "可以算回本期嗎?",
    a6: "含手續費的回本期、降月付 vs 縮年限情境比較、剩餘利息精算與最佳再融資時機屬於專業版功能。"
  },
  en: {
    badge: "Finance · Refinance Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Refinance Calculator",
    subtitle: "Enter remaining balance, current payment, and new terms to compute new payment and total savings",
    intro: "Refinance Calculator runs the standard formula in your browser. Enter remaining balance, current payment, new rate pct, new years to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Refinance Calculator",
    examplePreview: "Monthly Savings",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter remaining balance, current payment, new rate pct, new years",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Bal 400k · old 2500 · 4% · 20y",
    baselineExampleNote: "Remaining Balance 400000 · Current Payment 2500",
    activeExample: "Advanced example",
    activeExampleValue: "Bal 600k · old 3800 · 3.5% · 25y",
    activeExampleNote: "Remaining Balance doubled · watch Monthly Savings react",
    flowDemo: "Data flow demo",
    calculator: "Refinance Calculator",
    remainingBalance: "Remaining Balance",
    currentPayment: "Current Payment",
    newRatePct: "New Rate Pct",
    newYears: "New Years",
    resultCard: "Result card",
    primaryValue: "Monthly Savings",
    primaryUnitTail: "$",
    secondaryLabel: "New Payment",
    secondaryTail: "$",
    metricALabel: "Monthly Savings",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "New Payment",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "New Total Interest",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Refinance Calculator · live calc",
    fatLossTarget: "Lifetime Savings",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Refinance Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "New Total Interest",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Remaining Balance and New Rate Pct by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Refinance Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill remaining balance, current payment, new rate pct, new years.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Refinance Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Refinance Calculator · concept primer",
    definition: "Definition",
    definitionText: "Refinance Calculator converts inputs (remaining balance, current payment, new rate pct, new years) into Monthly Savings. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(remaining balance, current payment, new rate pct, new years)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Mortgage Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Refinance Decision Suite",
    premiumText: "Unlock fee-inclusive break-even, lower-payment vs shorter-term scenarios, exact interest, and optimal timing.",
    premiumChips_zh: "回本期|情境比較|利息精算|最佳時機",
    premiumChips_en: "Break-even|Scenarios|Exact|Timing",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Refinance Calculator calculate?",
    a1: "Refinance Calculator applies the standard formula to your inputs and returns Monthly Savings plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Refinance Calculator?",
    a2: "Enter remaining balance, current payment, new rate pct, new years. Refinance Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock fee-inclusive break-even, lower-payment vs shorter-term scenarios, exact interest, and optimal timing."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function RefinanceCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [remainingBalance, setRemainingBalance] = useState("400000");
  const [currentPayment, setCurrentPayment] = useState("2500");
  const [newRatePct, setNewRatePct] = useState("4");
  const [newYears, setNewYears] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
    const bal = Number(remainingBalance) || 0;
    const oldPay = Number(currentPayment) || 0;
    const r = (Number(newRatePct) || 0) / 100 / 12;
    const n = (Number(newYears) || 1) * 12;
    const newPay = r > 0 ? (bal * r) / (1 - Math.pow(1 + r, -n)) : bal / n;
    const monthlySave = oldPay - newPay;
    const newTotalInterest = newPay * n - bal;
    const lifetimeSave = monthlySave * n;
    return { newPay, monthlySave, newTotalInterest, lifetimeSave };
  }, [remainingBalance, currentPayment, newRatePct, newYears]);

  const primaryDisplay = fmt(result.monthlySave, 2);
  const secondaryDisplay = fmt(result.newPay, 2);
  const tertiaryDisplay = fmt(result.newTotalInterest, 2);
  const quaternaryDisplay = fmt(result.lifetimeSave, 2);

  function fillSolid() { setUnit("metric"); setRemainingBalance("400000"); setCurrentPayment("2500"); setNewRatePct("4"); setNewYears("20"); }
  function fillHighSalary() { setUnit("imperial"); setRemainingBalance("600000"); setCurrentPayment("3800"); setNewRatePct("3.5"); setNewYears("25"); }

  const activeBand = bands.find(b => {
    const r = result.monthlySave;
    if (r < 0.01) return 'tiny';
    if (r < 100) return 'normal';
    if (r < 300) return 'notable';
    if (r < 600) return 'high';
    if (r < 1000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fce7f3,_#fff7ed_45%,_#ffe4e6)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-pink-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-pink-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-pink-200 bg-pink-50 p-5 text-sm leading-6 text-pink-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-pink-100 bg-white/90 p-6 shadow-2xl shadow-pink-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-pink-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-pink-600 p-5 text-white"><div className="text-xs font-bold uppercase text-pink-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-pink-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{remainingBalance} × {currentPayment}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-pink-200 bg-pink-50 px-5 py-4 text-sm font-black text-pink-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-pink-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-pink-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.remainingBalance}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={remainingBalance} onChange={(e) => setRemainingBalance(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentPayment}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentPayment} onChange={(e) => setCurrentPayment(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.newRatePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={newRatePct} onChange={(e) => setNewRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.newYears}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={newYears} onChange={(e) => setNewYears(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-pink-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-pink-400 bg-pink-50 ring-2 ring-pink-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="refinance-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-pink-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-pink-50 p-4"><div className="text-xs font-black uppercase text-pink-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-pink-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-pink-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-pink-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-pink-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-pink-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-pink-300 bg-pink-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="refinance-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-pink-100 bg-pink-50 p-5 text-center font-black text-pink-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-pink-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-pink-200 bg-gradient-to-br from-pink-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
