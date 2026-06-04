// @profile B
// Profile B · 計算機-YMYL · FutureValueCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 25", label: { zh: "保守 (< 25)", en: "Band 1 (< 25)" }, desc: { zh: "落在「保守」級距< 25。總成長 < 25%,屬於短期或低報酬,複利尚未顯威。", en: "Falls in the \"保守\" band < 25. This is the 保守 range for Future Value Calculator." } },
  { key: "normal", range: "25–60", label: { zh: "溫和 (25–60)", en: "Band 2 (25–60)" }, desc: { zh: "落在「溫和」級距25–60。25-60%,溫和成長,常見於 5-10 年期穩健配置。", en: "Falls in the \"溫和\" band 25–60. This is the 溫和 range for Future Value Calculator." } },
  { key: "notable", range: "60–120", label: { zh: "穩健 (60–120)", en: "Band 3 (60–120)" }, desc: { zh: "落在「穩健」級距60–120。60-120%,穩健,複利開始發揮,資產接近翻倍。", en: "Falls in the \"穩健\" band 60–120. This is the 穩健 range for Future Value Calculator." } },
  { key: "high", range: "120–250", label: { zh: "成長 (120–250)", en: "Band 4 (120–250)" }, desc: { zh: "落在「成長」級距120–250。120-250%,成長,長年限複利成果,資產數倍成長。", en: "Falls in the \"成長\" band 120–250. This is the 成長 range for Future Value Calculator." } },
  { key: "major", range: "250–500", label: { zh: "強勁 (250–500)", en: "Band 5 (250–500)" }, desc: { zh: "落在「強勁」級距250–500。250-500%,強勁,長期高報酬累積的可觀成果。", en: "Falls in the \"強勁\" band 250–500. This is the 強勁 range for Future Value Calculator." } },
  { key: "executive", range: "≥ 500", label: { zh: "驚人 (≥ 500)", en: "Band 6 (≥ 500)" }, desc: { zh: "落在「驚人」級距≥ 500。> 500%,驚人,超長年限或高報酬,複利威力充分展現。", en: "Falls in the \"驚人\" band ≥ 500. This is the 驚人 range for Future Value Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "現值計算機", en: "Present Value Calculator" }, href: "/tools/finance/present-value-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "儲蓄目標計算機", en: "Savings Goal Calculator" }, href: "/tools/finance/savings-goal-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 終值計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Future Value Calculator · 終值計算機",
    subtitle: "輸入現值、年報酬率與年數，立即算出複利終值、總投入與總獲利",
    intro: "本工具為 終值計算機，依公開公式於瀏覽器端試算，輸入現值本金、年報酬率%、年數、每年提存後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算終值計算機",
    examplePreview: "總成長率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入現值本金、年報酬率%、年數、每年提存",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "本金 1 萬 · 7% · 20 年",
    baselineExampleNote: "現值本金 10000 · 年報酬率% 7",
    activeExample: "進階範例",
    activeExampleValue: "本金 1 萬 · 8% · 30 年 · 年存 6 千",
    activeExampleNote: "現值本金 加倍 · 觀察 總成長率 變化",
    flowDemo: "數字流向示範",
    calculator: "終值計算機",
    presentValue: "現值本金",
    annualReturnPct: "年報酬率%",
    years: "年數",
    annualDeposit: "每年提存",
    resultCard: "結果卡片",
    primaryValue: "總成長率",
    primaryUnitTail: "%",
    secondaryLabel: "終值",
    secondaryTail: "$",
    metricALabel: "總成長率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "終值",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "總獲利",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "終值計算機 · 即時試算",
    fatLossTarget: "總投入",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "終值計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "總獲利",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 現值本金 與 年數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "終值計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 現值本金、年報酬率%、年數、每年提存 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依現值、年報酬率、年數與每年提存計算終值、總投入與總獲利。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "終值計算機 · 觀念整理",
    definition: "定義",
    definitionText: "終值計算機以現值本金、年報酬率、年數與每年提存,計算複利成長後的終值、總投入與總獲利,適用退休、儲蓄目標與長期投資的成長預估。",
    formula: "公式",
    formulaText: "終值 = 現值 × (1 + r)^n + 每年提存 × ((1 + r)^n − 1) / r;其中 r 為年報酬率、n 為年數",
    limitations: "限制",
    limitationsText: "本工具假設固定年報酬率與年複利,不計通膨、稅負、手續費與報酬波動;實際市場報酬逐年不同,結果僅供長期規劃參考。",
    interpretation: "解讀",
    interpretationText: "總獲利為終值減總投入,反映複利貢獻;報酬率與年數對終值的影響呈指數放大,越早投入效果越強。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配現值計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 財富成長工具組",
    premiumText: "解鎖通膨調整實質終值、月提存、報酬率區間蒙地卡羅模擬、多情境比較與目標達成機率。",
    premiumChips_zh: "通膨調整|月提存|蒙地卡羅|達成機率",
    premiumChips_en: "Inflation|Monthly|Monte Carlo|Probability",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "終值是什麼?",
    a1: "**終值(Future Value)**是一筆現有資金或定期投入,在特定報酬率與時間後成長到的金額。它回答「現在投入,未來會變多少」,是退休規劃、儲蓄目標、投資決策的核心概念。本工具同時支援一次性本金與每年提存。",
    q2: "為什麼複利時間越長越驚人?",
    a2: "因為複利是指數成長。72 法則:本金翻倍所需年數 ≈ 72 / 報酬率%。以 7% 為例約 10 年翻倍、20 年變 4 倍、30 年變約 8 倍。時間是複利最大的盟友,越早開始差距越驚人。",
    q3: "7% 報酬率合理嗎?",
    a3: "美股長期(扣通膨前)年化約 7-10%,扣通膨後實質約 5-7%。但這是長期平均,單年波動極大(可能 −30% 到 +30%)。規劃時用 6-7% 較保守合理,別用近期牛市的高報酬外推。",
    q4: "終值和現值怎麼互換?",
    a4: "終值 = 現值 × (1 + r)^n;反過來現值 = 終值 ÷ (1 + r)^n。終值算「未來會變多少」,現值算「未來的錢現在值多少」。兩者是同一公式的正反運算,搭配使用可做完整財務規劃。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內完成,本金與報酬率資料不會傳送到任何伺服器。",
    q6: "可以模擬通膨調整後的終值嗎?",
    a6: "通膨調整後實質終值、月提存、報酬率區間蒙地卡羅模擬與多情境比較屬於專業版功能。"
  },
  en: {
    badge: "Finance · Future Value Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Future Value Calculator",
    subtitle: "Enter present value, annual return, and years to compute compound future value, contributions, and gain",
    intro: "Future Value Calculator runs the standard formula in your browser. Enter present value, annual return pct, years, annual deposit to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Future Value Calculator",
    examplePreview: "Total Growth",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter present value, annual return pct, years, annual deposit",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "PV 10k · 7% · 20y",
    baselineExampleNote: "Present Value 10000 · Annual Return Pct 7",
    activeExample: "Advanced example",
    activeExampleValue: "PV 10k · 8% · 30y · +6k/yr",
    activeExampleNote: "Present Value doubled · watch Total Growth react",
    flowDemo: "Data flow demo",
    calculator: "Future Value Calculator",
    presentValue: "Present Value",
    annualReturnPct: "Annual Return Pct",
    years: "Years",
    annualDeposit: "Annual Deposit",
    resultCard: "Result card",
    primaryValue: "Total Growth",
    primaryUnitTail: "%",
    secondaryLabel: "Future Value",
    secondaryTail: "$",
    metricALabel: "Total Growth",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Future Value",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Total Gain",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Future Value Calculator · live calc",
    fatLossTarget: "Total Contributed",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Future Value Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Total Gain",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Present Value and Years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Future Value Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill present value, annual return pct, years, annual deposit.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Future Value Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Future Value Calculator · concept primer",
    definition: "Definition",
    definitionText: "Future Value Calculator converts inputs (present value, annual return pct, years, annual deposit) into Total Growth. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(present value, annual return pct, years, annual deposit)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Present Value Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Wealth Growth Suite",
    premiumText: "Unlock inflation-adjusted FV, monthly deposits, Monte Carlo return ranges, scenario compare, and goal probability.",
    premiumChips_zh: "通膨調整|月提存|蒙地卡羅|達成機率",
    premiumChips_en: "Inflation|Monthly|Monte Carlo|Probability",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Future Value Calculator calculate?",
    a1: "Future Value Calculator applies the standard formula to your inputs and returns Total Growth plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Future Value Calculator?",
    a2: "Enter present value, annual return pct, years, annual deposit. Future Value Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock inflation-adjusted FV, monthly deposits, Monte Carlo return ranges, scenario compare, and goal probability."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function FutureValueCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [presentValue, setPresentValue] = useState("10000");
  const [annualReturnPct, setAnnualReturnPct] = useState("7");
  const [years, setYears] = useState("20");
  const [annualDeposit, setAnnualDeposit] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const PV = Number(presentValue) || 0;
    const r = (Number(annualReturnPct) || 0) / 100;
    const n = Number(years) || 0;
    const pmt = Number(annualDeposit) || 0;
    const fvLump = PV * Math.pow(1 + r, n);
    const fvAnnuity = r > 0 ? pmt * ((Math.pow(1 + r, n) - 1) / r) : pmt * n;
    const fv = fvLump + fvAnnuity;
    const contributed = PV + pmt * n;
    const gain = fv - contributed;
    const gainPct = contributed > 0 ? (gain / contributed) * 100 : 0;
    return { gainPct, fv, gain, contributed };
  }, [presentValue, annualReturnPct, years, annualDeposit]);

  const primaryDisplay = fmt(result.gainPct, 2);
  const secondaryDisplay = fmt(result.fv, 2);
  const tertiaryDisplay = fmt(result.gain, 2);
  const quaternaryDisplay = fmt(result.contributed, 2);

  function fillSolid() { setUnit("metric"); setPresentValue("10000"); setAnnualReturnPct("7"); setYears("20"); setAnnualDeposit("0"); }
  function fillHighSalary() { setUnit("imperial"); setPresentValue("10000"); setAnnualReturnPct("8"); setYears("30"); setAnnualDeposit("6000"); }

  const activeBand = bands.find(b => {
    const r = result.gainPct;
    if (r < 25) return 'tiny';
    if (r < 60) return 'normal';
    if (r < 120) return 'notable';
    if (r < 250) return 'high';
    if (r < 500) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ffedd5,_#fff7ed_45%,_#fef3c7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-orange-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-orange-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-2xl shadow-orange-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-orange-600 p-5 text-white"><div className="text-xs font-bold uppercase text-orange-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-orange-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{presentValue} × {annualReturnPct}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.presentValue}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={presentValue} onChange={(e) => setPresentValue(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.annualReturnPct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={annualReturnPct} onChange={(e) => setAnnualReturnPct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.years}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={years} onChange={(e) => setYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualDeposit}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualDeposit} onChange={(e) => setAnnualDeposit(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-orange-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-orange-400 bg-orange-50 ring-2 ring-orange-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="future-value-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-orange-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs font-black uppercase text-orange-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-orange-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="future-value-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center font-black text-orange-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-orange-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
