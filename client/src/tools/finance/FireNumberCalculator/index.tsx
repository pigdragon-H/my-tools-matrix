// @profile B
// Profile B · 計算機-YMYL · FireNumberCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 20", label: { zh: "剛起步 (< 20)", en: "Just starting (< 20)" }, desc: { zh: "落在「剛起步」級距< 20。達成進度偏低,提高儲蓄率並讓資產持續複利成長。", en: "Falls in the \"Just starting\" band (< 20). Progress is low; raise savings rate and let assets compound." } },
  { key: "normal", range: "20–40", label: { zh: "穩步累積 (20–40)", en: "Steady build (20–40)" }, desc: { zh: "落在「穩步累積」級距20–40。已穩步累積,維持紀律可加速縮短達標年數。", en: "Falls in the \"Steady build\" band (20–40). Steadily building; discipline will shorten years to target." } },
  { key: "notable", range: "40–60", label: { zh: "過半達標 (40–60)", en: "Past halfway (40–60)" }, desc: { zh: "落在「過半達標」級距40–60。已過半,核心資產正快速逼近目標數字。", en: "Falls in the \"Past halfway\" band (40–60). Past halfway; core assets approaching the target fast." } },
  { key: "high", range: "60–80", label: { zh: "接近目標 (60–80)", en: "Closing in (60–80)" }, desc: { zh: "落在「接近目標」級距60–80。接近目標,複利效應顯著,終點在望。", en: "Falls in the \"Closing in\" band (60–80). Closing in; compounding is significant, finish line in sight." } },
  { key: "major", range: "80–100", label: { zh: "幾近達標 (80–100)", en: "Almost there (80–100)" }, desc: { zh: "落在「幾近達標」級距80–100。幾乎達標,微調支出或報酬即可跨過終點。", en: "Falls in the \"Almost there\" band (80–100). Almost there; small tweaks to spending or return cross the line." } },
  { key: "executive", range: "≥ 100", label: { zh: "已達 FIRE (≥ 100)", en: "FIRE reached (≥ 100)" }, desc: { zh: "落在「已達 FIRE」級距≥ 100。已達或超越 FIRE 目標,理論上可仰賴提領生活。", en: "Falls in the \"FIRE reached\" band (≥ 100). At or beyond FIRE; you can theoretically live off withdrawals." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "提領率計算機", en: "Withdrawal Rate Calculator" }, href: "/tools/finance/withdrawal-rate-calculator" },
  { label: { zh: "Coast FIRE 計算機", en: "Coast FIRE Calculator" }, href: "/tools/finance/coast-fire-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · FIRE 目標數字計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "FIRE Number Calculator · FIRE 目標數字計算機",
    subtitle: "以安全提領率回推財務自由所需資產,評估目前進度與達標年數。",
    intro: "本工具為 FIRE 目標數字計算機，依公開公式於瀏覽器端試算，輸入預計年支出、安全提領率、目前已存資產、預期年化報酬率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算FIRE 目標數字計算機",
    examplePreview: "FIRE 目標資產",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入預計年支出、安全提領率、目前已存資產、預期年化報酬率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "標準 4% 情境",
    baselineExampleNote: "預計年支出 40000 · 安全提領率 4",
    activeExample: "進階範例",
    activeExampleValue: "保守提早情境",
    activeExampleNote: "預計年支出 加倍 · 觀察 FIRE 目標資產 變化",
    flowDemo: "數字流向示範",
    calculator: "FIRE 目標數字計算機",
    expectedAnnualSpending: "預計年支出",
    safeWithdrawalRate: "安全提領率",
    currentSavedAssets: "目前已存資產",
    expectedAnnualReturn: "預期年化報酬率",
    resultCard: "結果卡片",
    primaryValue: "FIRE 目標資產",
    primaryUnitTail: "$",
    secondaryLabel: "目標達成進度",
    secondaryTail: "%",
    metricALabel: "FIRE 目標資產",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "目標達成進度",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "尚需累積金額",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "FIRE 目標數字計算機 · 即時試算",
    fatLossTarget: "預估達標年數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "FIRE 目標數字計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "尚需累積金額",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 預計年支出 與 目前已存資產 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "FIRE 目標數字計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 預計年支出、安全提領率、目前已存資產、預期年化報酬率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "FIRE number target。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "FIRE 目標數字計算機 · 觀念整理",
    definition: "定義",
    definitionText: "FIRE 目標數字計算機以「安全提領率」回推財務自由所需的資產規模(FIRE Number = 年支出 ÷ 提領率),並評估目前進度與達標年數。",
    formula: "公式",
    formulaText: "FIRE 目標 = 年支出 ÷ 安全提領率;達成進度 = 已存資產 ÷ FIRE 目標;達標年數 = ln(目標 ÷ 已存) ÷ ln(1 + 年化報酬率)。",
    limitations: "限制",
    limitationsText: "本工具假設提領率與報酬率固定且無追加投入,未計入通膨、稅負、市場波動與提領順序風險,實際結果會偏離估算。",
    interpretation: "解讀",
    interpretationText: "目標達成進度越高,代表越接近財務自由;尚需累積金額與達標年數則指出剩餘距離。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配提領率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "FIRE Pro 進階規劃",
    premiumText: "進階版加入通膨調整目標、Monte Carlo 存活率、分階段提領與多情境達標路徑,協助您精算真正的財務自由時間表。",
    premiumChips_zh: "通膨調整|Monte Carlo|分階段提領|多情境路徑",
    premiumChips_en: "Inflation-adj|Monte Carlo|Phased|Multi-scenario",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "FIRE 目標數字怎麼算?",
    a1: "FIRE 目標數字 = 預計年支出 ÷ 安全提領率。以 4% 提領率為例,即年支出的 25 倍。",
    q2: "為什麼預設提領率是 4%?",
    a2: "4% 源自 Trinity Study,指退休後每年提領初始資產 4%,歷史上多數情境可支撐 30 年。保守者可調低至 3%–3.5%。",
    q3: "達成進度代表什麼?",
    a3: "達成進度 = 目前已存資產 ÷ FIRE 目標數字,反映您距離財務自由的百分比。",
    q4: "達標年數怎麼推估?",
    a4: "在僅靠複利、不再追加投入的假設下,以 ln(目標/現有) ÷ ln(1+報酬率) 估算達標年數。",
    q5: "降低年支出影響有多大?",
    a5: "FIRE 數字與年支出成正比,降低年支出會等比例降低目標,是最有效的縮短途徑之一。",
    q6: "結果能當退休保證嗎?",
    a6: "不能。結果為簡化估算,未計入通膨、稅負、報酬波動與提領順序風險,僅供規劃參考。"
  },
  en: {
    badge: "Finance · FIRE Number Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "FIRE Number Calculator",
    subtitle: "Back-solve the assets needed for financial independence from your safe withdrawal rate.",
    intro: "FIRE Number Calculator runs the standard formula in your browser. Enter expected annual spending, safe withdrawal rate, current saved assets, expected annual return to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try FIRE Number Calculator",
    examplePreview: "FIRE target number",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter expected annual spending, safe withdrawal rate, current saved assets, expected annual return",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Standard 4% case",
    baselineExampleNote: "Expected annual spending 40000 · Safe withdrawal rate 4",
    activeExample: "Advanced example",
    activeExampleValue: "Conservative early case",
    activeExampleNote: "Expected annual spending doubled · watch FIRE target number react",
    flowDemo: "Data flow demo",
    calculator: "FIRE Number Calculator",
    expectedAnnualSpending: "Expected annual spending",
    safeWithdrawalRate: "Safe withdrawal rate",
    currentSavedAssets: "Current saved assets",
    expectedAnnualReturn: "Expected annual return",
    resultCard: "Result card",
    primaryValue: "FIRE target number",
    primaryUnitTail: "$",
    secondaryLabel: "Progress to FIRE",
    secondaryTail: "%",
    metricALabel: "FIRE target number",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Progress to FIRE",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Remaining gap",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "FIRE Number Calculator · live calc",
    fatLossTarget: "Years to FIRE",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "FIRE Number Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Remaining gap",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Expected annual spending and Current saved assets by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "FIRE Number Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill expected annual spending, safe withdrawal rate, current saved assets, expected annual return.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "FIRE Number Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "FIRE Number Calculator · concept primer",
    definition: "Definition",
    definitionText: "FIRE Number Calculator converts inputs (expected annual spending, safe withdrawal rate, current saved assets, expected annual return) into FIRE target number. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(expected annual spending, safe withdrawal rate, current saved assets, expected annual return)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Withdrawal Rate Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "FIRE Pro Planning",
    premiumText: "Pro adds inflation-adjusted targets, Monte Carlo survival rates, phased withdrawals, and multi-scenario paths to refine your true FIRE timeline.",
    premiumChips_zh: "通膨調整|Monte Carlo|分階段提領|多情境路徑",
    premiumChips_en: "Inflation-adj|Monte Carlo|Phased|Multi-scenario",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does FIRE Number Calculator calculate?",
    a1: "FIRE Number Calculator applies the standard formula to your inputs and returns FIRE target number plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for FIRE Number Calculator?",
    a2: "Enter expected annual spending, safe withdrawal rate, current saved assets, expected annual return. FIRE Number Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds inflation-adjusted targets, Monte Carlo survival rates, phased withdrawals, and multi-scenario paths to refine your true FIRE timeline."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function FireNumberCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [expectedAnnualSpending, setExpectedAnnualSpending] = useState("40000");
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState("4");
  const [currentSavedAssets, setCurrentSavedAssets] = useState("150000");
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState("7");
  const t = ui[lang];

  const result = useMemo(() => {
const spend = Number(expectedAnnualSpending) || 0; const swr = (Number(safeWithdrawalRate) || 0) / 100; const saved = Number(currentSavedAssets) || 0; const r = (Number(expectedAnnualReturn) || 0) / 100; const fireNumber = swr > 0 ? spend / swr : 0; const gap = Math.max(0, fireNumber - saved); const progressPct = fireNumber > 0 ? (saved / fireNumber) * 100 : 0; let yearsToFire = 0; if (gap > 0 && r > 0 && saved > 0) { yearsToFire = Math.log(fireNumber / saved) / Math.log(1 + r); } else if (gap <= 0) { yearsToFire = 0; } return { primaryKey: fireNumber, secondaryKey: progressPct, tertiaryKey: gap, quaternaryKey: yearsToFire };
  }, [expectedAnnualSpending, safeWithdrawalRate, currentSavedAssets, expectedAnnualReturn]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 1);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setExpectedAnnualSpending("40000"); setSafeWithdrawalRate("4"); setCurrentSavedAssets("150000"); setExpectedAnnualReturn("7"); }
  function fillHighSalary() { setUnit("imperial"); setExpectedAnnualSpending("30000"); setSafeWithdrawalRate("3.5"); setCurrentSavedAssets("400000"); setExpectedAnnualReturn("8"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 20) return 'tiny';
    if (r < 40) return 'normal';
    if (r < 60) return 'notable';
    if (r < 80) return 'high';
    if (r < 100) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-orange-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-orange-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-2xl shadow-orange-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-orange-600 p-5 text-white"><div className="text-xs font-bold uppercase text-orange-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-orange-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{expectedAnnualSpending} × {safeWithdrawalRate}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.expectedAnnualSpending}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={expectedAnnualSpending} onChange={(e) => setExpectedAnnualSpending(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.safeWithdrawalRate}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={safeWithdrawalRate} onChange={(e) => setSafeWithdrawalRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentSavedAssets}<input type="number" step="5000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentSavedAssets} onChange={(e) => setCurrentSavedAssets(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.expectedAnnualReturn}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={expectedAnnualReturn} onChange={(e) => setExpectedAnnualReturn(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-orange-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-orange-400 bg-orange-50 ring-2 ring-orange-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="fire-number-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="fire-number-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center font-black text-orange-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-orange-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
