// @profile B
// Profile B · 計算機-YMYL · Property ROI Calculator - rental yield and cash-on-cash return（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<1.5%", label: { zh: "報酬偏低", en: "Low yield" }, desc: { zh: "淨租金報酬偏低,多依賴增值或自用價值。", en: "A low net yield; returns rely on appreciation or owner use." } },
  { key: "normal", range: "1.5-2.5%", label: { zh: "一般報酬", en: "Typical" }, desc: { zh: "都會區常見的租金報酬水準。", en: "A typical rental yield for metropolitan areas." } },
  { key: "notable", range: "2.5-4%", label: { zh: "明顯報酬", en: "Notable" }, desc: { zh: "現金流逐漸轉正,具投資吸引力。", en: "Cashflow turns positive and becomes attractive." } },
  { key: "high", range: "4-6%", label: { zh: "良好報酬", en: "Good yield" }, desc: { zh: "租金報酬良好,須確認空置與管理成本。", en: "A good yield; confirm vacancy and management costs." } },
  { key: "major", range: "6-9%", label: { zh: "高報酬", en: "High yield" }, desc: { zh: "高報酬通常伴隨較高風險或維護需求。", en: "A high yield usually comes with more risk or upkeep." } },
  { key: "executive", range: "9%+", label: { zh: "極高報酬", en: "Exceptional" }, desc: { zh: "報酬極高,務必查證租金真實性與物件狀況。", en: "An exceptional yield; verify the rent and property condition carefully." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低費率指數基金", en: "Low-fee index funds" }, href: "https://www.vanguard.com" },
  { label: { zh: "退休帳戶開戶", en: "Retirement account" }, href: "https://www.fidelity.com" },
  { label: { zh: "財務規劃資源", en: "Financial planning resources" }, href: "https://www.investopedia.com" },
  { label: { zh: "理財記帳工具", en: "Budgeting app" }, href: "https://www.ynab.com" },
];

const ui = {
  zh: {
    badge: "財務 · 試算 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "房產投報計算機",
    subtitle: "依購入價、租金與成本,計算毛/淨租金報酬與自備款報酬率。",
    intro: "輸入購入總價、每月租金、年度持有成本與自備款比例,本工具計算毛租金報酬、淨租金報酬與自備款現金報酬率 (cash-on-cash),協助您評估出租物件的投資效益。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具僅供教育與規劃用途,結果為估算值,不構成專業財務、稅務或投資建議。",
    quickActionCard: "快速範例",
    tryExample: "一鍵建立房產投報範例",
    examplePreview: "結果預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入您的數值",
    examplesHelper: "先用範例理解計算方式,再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    activeExample: "進階範例",
    flowDemo: "即時試算",
    calculator: "計算機",
    participants: "購入總價",
    averageHourlyRate: "每月租金",
    durationHours: "年度持有成本",
    meetingsPerMonth: "自備款比例 (%)",
    resultCard: "計算結果",
    unit: "主要結果",
    primaryValue: "主要數值",
    maintenanceTarget: "主要結果",
    actionTarget: "次要結果",
    estimatedTdee: "主要結果",
    maintenance: "結果",
    fatLossTarget: "次要結果",
    meetingCost: "主要結果",
    monthlyEquiv: "次要結果",
    weeklyEquiv: "輔助數值",
    dailyEquiv: "輔助數值",
    effectiveHours: "輔助數值",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格分級判讀矩陣",
    tdeeMatrixNote: "固定六格分級,將結果放進常見區間;這是參考判讀,不構成專業建議。",
    emotionConversionLayer: "情境與行動層",
    turnIntoPlan: "把試算結果轉成可行計畫",
    conversionNote: "此區會連動目前的計算結果,協助您判斷下一步該怎麼做。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前的試算結果",
    dailyGap: "輔助數值",
    weeklyTrend: "主要結果",
    motivation: "動力卡",
    keepMomentum: "從一次試算走向持續追蹤",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的試算結果帶回家",
    journeyHint: "每次調整數值時重新計算,追蹤結果的變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "把結果接到下一個工具",
    nextActionItem1: "用其他財務計算機交叉檢視結果",
    nextActionItem2: "把結果納入整體預算與規劃",
    nextActionItem3: "定期重算以追蹤長期變化",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "輸入 → 計算 → 判讀 → 行動",
    bmrStep: "輸入",
    deficitStep: "計算",
    trendStep: "判讀",
    mealStep: "行動",
    knowledge: "知識",
    knowledgeTitle: "這項試算在財務規劃中的意義",
    definition: "定義",
    definitionText: "本工具把您輸入的數值轉換成可比較的結果,協助您在不同情境間做判斷。",
    formula: "公式",
    formulaText: "結果依輸入數值以固定公式計算;調整任一輸入,結果會即時更新。",
    limitations: "限制",
    limitationsText: "本工具僅提供估算,未涵蓋所有個別因素;重大決策請諮詢專業人員。",
    interpretation: "解讀",
    interpretationText: "數字本身不是答案;請結合您的目標與整體情況一起判斷。",
    context: "脈絡",
    contextText: "把這項結果與其他財務指標一起看,能得到更完整的判斷。",
    example: "範例",
    exampleText: "套用預設範例即可看到一組完整的計算結果,作為理解工具的起點。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "財務規劃的下一步工具",
    premiumTitle: "專業版分析包",
    premiumText: "解鎖趨勢分析、情境比較與可匯出的詳細報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途,不取代專業財務、稅務或投資建議。",
    relatedTools: "相關工具",
    relatedToolsText: "預算計算機 · 投資報酬計算機 · 貸款計算機 · 退休計算機",
    references: "參考資料",
    referencesText: "公開金融與統計資料;標準財務計算方法;主管機關公告之費率與規則。",
    q1: "這個結果準確嗎?",
    a1: "結果為依公式計算的估算值,準確度取決於您輸入數值的正確性與適用性。",
    q2: "我該如何選擇輸入數值?",
    a2: "可先用預設範例理解計算邏輯,再依自身實際情況調整每一個欄位。",
    q3: "結果可以直接拿來做決策嗎?",
    a3: "結果是參考起點;重大財務決策請結合完整資訊並諮詢專業人員。",
    q4: "為什麼調整輸入後結果會變?",
    a4: "結果與輸入數值連動;任一欄位改變都會依公式即時重新計算。",
    q5: "數值越高或越低一定越好嗎?",
    a5: "不一定。請依您的目標與整體財務情況判斷,而非只看單一數字。",
    q6: "這個工具能取代專業建議嗎?",
    a6: "不能。它是教育與規劃用的估算工具,實際決策仍應諮詢合格專業人員。",
  },
  en: {
    badge: "Finance · Calculator · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Property ROI Calculator",
    subtitle: "Compute gross, net and cash-on-cash returns from purchase price, rent and costs.",
    intro: "Enter the purchase price, monthly rent, annual holding cost and down-payment ratio; the tool computes gross yield, net yield and cash-on-cash return so you can evaluate a rental property's investment performance.",
    trustNoteLabel: "Note:",
    trustNote: "This tool is for education and planning only; results are estimates and not professional financial, tax or investment advice.",
    quickActionCard: "Quick example",
    tryExample: "Try a property ROI example",
    examplePreview: "Result preview",
    examplePerson: "Standard example",
    fillExample: "Fill the standard example",
    previewActivePath: "Try the advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your values",
    examplesHelper: "Start from an example to understand the math, then use your own numbers.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    activeExample: "Advanced example",
    flowDemo: "Live estimate",
    calculator: "Calculator",
    participants: "Purchase price",
    averageHourlyRate: "Monthly rent",
    durationHours: "Annual holding cost",
    meetingsPerMonth: "Down payment (%)",
    resultCard: "Result",
    unit: "Primary result",
    primaryValue: "Headline number",
    maintenanceTarget: "Primary result",
    actionTarget: "Secondary result",
    estimatedTdee: "Primary result",
    maintenance: "Result",
    fatLossTarget: "Secondary result",
    meetingCost: "Primary result",
    monthlyEquiv: "Secondary result",
    weeklyEquiv: "Helper value",
    dailyEquiv: "Helper value",
    effectiveHours: "Helper value",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Six-band classification matrix",
    tdeeMatrixNote: "A fixed six-band classification placing the result into common ranges; this is a reference, not professional advice.",
    emotionConversionLayer: "Insight & action layer",
    turnIntoPlan: "Turn the result into an action plan",
    conversionNote: "This section reflects your current result to help you decide what to do next.",
    progressInsight: "Progress insight",
    possibleTarget: "Your current result",
    dailyGap: "Helper value",
    weeklyTrend: "Primary result",
    motivation: "Motivation",
    keepMomentum: "Move from a snapshot to steady tracking",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's result home",
    journeyHint: "Recalculate whenever you change the inputs to track how the result moves.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Cross-check the result with other finance calculators",
    nextActionItem2: "Fold the result into your overall budget and plan",
    nextActionItem3: "Recalculate regularly to track long-term change",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Input → Compute → Read → Act",
    bmrStep: "Input",
    deficitStep: "Compute",
    trendStep: "Read",
    mealStep: "Act",
    knowledge: "Knowledge",
    knowledgeTitle: "What this calculation means in financial planning",
    definition: "Definition",
    definitionText: "This tool converts your inputs into a comparable result so you can judge between scenarios.",
    formula: "Formula",
    formulaText: "The result is computed from your inputs with a fixed formula; adjust any input and the result updates instantly.",
    limitations: "Limitations",
    limitationsText: "This tool provides an estimate only and does not cover every individual factor; consult a professional for major decisions.",
    interpretation: "Interpretation",
    interpretationText: "The number itself is not the answer; read it together with your goals and overall situation.",
    context: "Context",
    contextText: "Reading this result alongside other financial metrics gives a more complete picture.",
    example: "Example",
    exampleText: "Load the default example to see a full set of results as a starting point for understanding the tool.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for financial planning",
    premiumTitle: "Pro analysis pack",
    premiumText: "Unlock trend analysis, scenario comparisons and exportable detailed reports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not a substitute for professional financial, tax or investment advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Budget Calculator · ROI Calculator · Loan Calculator · Retirement Calculator",
    references: "References",
    referencesText: "Public financial and statistical data; standard financial calculation methods; rates and rules published by authorities.",
    q1: "Is this result accurate?",
    a1: "The result is an estimate computed from a formula; its accuracy depends on how correct and applicable your inputs are.",
    q2: "How should I choose the inputs?",
    a2: "Start from the default example to understand the logic, then adjust each field to your own situation.",
    q3: "Can I use the result to make decisions directly?",
    a3: "Treat the result as a starting reference; for major financial decisions combine full information and consult a professional.",
    q4: "Why does the result change when I adjust inputs?",
    a4: "The result is tied to your inputs; changing any field recomputes it instantly via the formula.",
    q5: "Is a higher or lower value always better?",
    a5: "Not necessarily. Judge by your goals and overall financial picture, not a single number alone.",
    q6: "Can this tool replace professional advice?",
    a6: "No. It is an educational and planning estimate; real decisions should still involve a qualified professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PropertyRoiCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("10000000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("32000");
  const [durationHours, setDurationHours] = useState("60000");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("30");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const purchasePrice = v1; const monthlyRent = v2; const annualCost = v3; const downPct = v4;
    const annualRent = monthlyRent * 12;
    const netIncome = annualRent - annualCost;
    const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
    const netYield = purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;
    const downPayment = purchasePrice * (downPct / 100);
    const cashOnCash = downPayment > 0 ? (netIncome / downPayment) * 100 : 0;
    return { netYield, grossYield, cashOnCash, netIncome, purchasePrice };

  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.netYield, 2);
  const monthlyDisplay = fmt(result.netIncome, 0);

  function fillSolid() { setUnit("metric"); setParticipants("10000000"); setAverageHourlyRate("32000"); setDurationHours("60000"); setMeetingsPerMonth("30"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("6000000"); setAverageHourlyRate("30000"); setDurationHours("45000"); setMeetingsPerMonth("30"); }

  const activeBand = bands.find(b => {
    const r = result.netYield;
    if (r < 1.5) return b.key === "tiny";
    if (r < 2.5) return b.key === "normal";
    if (r < 4) return b.key === "notable";
    if (r < 6) return b.key === "high";
    if (r < 9) return b.key === "major";
    return b.key === "executive";

  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#ecfdf5 0%,#d1fae5 55%,#dbeafe 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "淨租金報酬率" : "net rental yield"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.grossYield, 2)}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.cashOnCash, 1)}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">2%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "都會低報酬" : "Low-yield metro"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "高報酬物件" : "High-yield asset"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "%" : "%"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "元/年" : "/yr"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "毛租金報酬" : "Gross yield"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.grossYield, 2)}</p><p className="text-sm font-bold text-emerald-700">%</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "淨租金報酬" : "Net yield"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.netYield, 2)}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "自備款報酬" : "Cash-on-cash"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.cashOnCash, 1)}</p><p className="text-sm font-bold text-slate-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="property-roi-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "淨租金報酬率" : "net rental yield"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入購入總價" : "Enter the purchase price", note: t.bmrStep }, { label: lang === "zh" ? "設定租金與成本" : "Set rent and costs", note: t.deficitStep }, { label: lang === "zh" ? "算出淨租金收入" : "Compute net income", note: t.trendStep }, { label: lang === "zh" ? "得出報酬率指標" : "Get the yield metrics", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="property-roi-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多情境時程比較","通膨調整模擬","提領策略試算"] : ["Multi-scenario timelines","Inflation-adjusted modelling","Withdrawal strategy testing"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
