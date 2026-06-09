// @profile B
// Profile B · 計算機-YMYL · Affordability計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<$150k", label: { zh: "入門", en: "Entry" }, desc: { zh: "可負擔房價偏低，適合首購或自備款較少的買方。", en: "Affordable price is low — suitable for first-time buyers or smaller down payments." } },
  { key: "normal", range: "$150k-300k", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見的可負擔範圍，仍應保留緊急預備金。", en: "A common affordable range — still keep an emergency reserve." } },
  { key: "notable", range: "$300k-500k", label: { zh: "中高", en: "Notable" }, desc: { zh: "房價開始顯著，建議確認月供占收入比例。", en: "Price is becoming notable — confirm the payment-to-income ratio." } },
  { key: "high", range: "$500k-750k", label: { zh: "高價", en: "High" }, desc: { zh: "高總價房屋，月供壓力應留意收入穩定性。", en: "High-price home — watch income stability against the monthly payment." } },
  { key: "major", range: "$750k-1m", label: { zh: "重大", en: "Major" }, desc: { zh: "重大負擔，適合收入穩定且自備款充足的買方。", en: "Major commitment — suitable for stable income and a strong down payment." } },
  { key: "executive", range: ">$1m", label: { zh: "頂級", en: "Premium" }, desc: { zh: "頂級總價，必須對應高且穩定的家庭收入。", en: "Premium price — must match a high, stable household income." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "房貸試算計算機", en: "Mortgage Calculator" }, href: "/tools/finance/mortgage-calculator" },
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "債務償還計算機", en: "Debt Payoff Calculator" }, href: "/tools/finance/debt-payoff-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 購屋負擔 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Affordability Calculator · 購屋負擔能力計算機", subtitle: "依收入、債務與利率估算您可負擔的房價與月供",
    intro: "本工具根據月收入、現有月債務、頭期款、貸款利率與年限，估算您可負擔的房屋總價與每月房貸支出，幫助您在看屋前先設定務實預算。",
    trustNoteLabel: "注意事項：", trustNote: "此工具以常見的負債收入比與利率估算可負擔房價；未計入稅金、保險、管理費、維修與生活開銷波動。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立購屋負擔範例", examplePreview: "可負擔房價預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高收入範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入月收入、月債務與利率", examplesHelper: "先用範例理解購屋負擔計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準家庭 · 月收入 $6k", activeExample: "高收入家庭", flowDemo: "$6k · 利率 6%", calculator: "計算機",
    participants: "月稅後收入 ($)", averageHourlyRate: "現有月債務 ($)", durationHours: "貸款利率 (%)", meetingsPerMonth: "貸款年限 (年)",
    resultCard: "購屋負擔計算結果", unit: "可負擔房價 ($)", primaryValue: "主要數值", maintenanceTarget: "可負擔房價 ($)", actionTarget: "每月房貸", estimatedTdee: "可負擔房價", maintenance: "可負擔", fatLossTarget: "每月房貸",
    meetingCost: "可負擔房價", monthlyEquiv: "每月房貸", weeklyEquiv: "可用月供", dailyEquiv: "建議自備款", effectiveHours: "負債收入比",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格購屋負擔判讀矩陣", tdeeMatrixNote: "L7 固定六格，將可負擔房價放進常見區間；這是規劃參考，不是貸款核准或專業財務建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把購屋負擔盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示可負擔房價、每月房貸與自備款，協助判斷是否需要調整房價區間或增加頭期款。",
    progressInsight: "進度洞察卡", possibleTarget: "目前購屋負擔計畫", dailyGap: "建議自備款", weeklyTrend: "可負擔房價", motivation: "動力卡", keepMomentum: "從負擔盤點走向穩定購屋計畫",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的購屋負擔盤點帶回家", journeyHint: "每次調整收入、債務或利率時重新計算，追蹤可負擔房價與月供的變化。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用房貸試算計算機估算實際每月本息攤還", nextActionItem2: "用貸款計算機比較不同利率與年限的總利息", nextActionItem3: "用債務償還計算機檢視現有債務對負擔的影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "購屋負擔 → 房貸試算 → 貸款比較 → 退休規劃", bmrStep: "購屋負擔", deficitStep: "房貸試算", trendStep: "貸款比較", mealStep: "退休規劃",
    knowledge: "知識", knowledgeTitle: "購屋負擔能力在財務規劃中的意義", definition: "定義", definitionText: "購屋負擔能力是把收入、債務與利率轉換成可負擔的房屋總價，常用於看屋前設定務實預算，避免買到月供過重的房屋。",
    formula: "公式", formulaText: "可用月供 = 月收入 × 負債收入比上限 − 現有月債務。可負擔房貸本金 = 可用月供 ÷ 月利率係數。可負擔房價 = 可負擔本金 + 頭期款。",
    limitations: "限制", limitationsText: "本工具只估算可負擔房價；未納入房屋稅、保險、社區管理費、維修、利率變動與家庭支出變化。",
    interpretation: "解讀", interpretationText: "可負擔房價高不代表應買到上限；保留緩衝能降低利率上升或收入波動的風險。關鍵是月供占收入比例是否健康。",
    context: "脈絡", contextText: "購屋負擔應搭配緊急預備金、生涯規劃與未來收入展望一起看，而不是只看單一可負擔上限。",
    example: "範例", exampleText: "月稅後收入 $6,000、現有月債務 $500、利率 6%、年限 30 年、頭期款 $40,000。可用月供約 $1,660，可負擔房價約 $317,000。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "購屋負擔規劃的下一步工具", premiumTitle: "專業版購屋負擔治理包", premiumText: "解鎖負擔趨勢、利率情境比較、自備款規劃建議與家庭購屋預算報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代貸款顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "房貸試算計算機 · 貸款計算機 · 債務償還計算機 · 退休計算機", references: "參考資料", referencesText: "常見房貸負債收入比準則；金融機構購屋負擔指引；個人理財預算研究；房地產可負擔性報告。",
    q1: "可負擔房價應該看上限還是保守值？", a1: "建議看保守值。可負擔上限是極限，保留緩衝能應對利率上升、收入波動與意外支出，讓財務更安全。",
    q2: "負債收入比要抓多少？", a2: "常見準則是月房貸不超過月收入的 28%，含所有債務的總負債不超過 36%。本工具預設以此估算可用月供。",
    q3: "頭期款要算進去嗎？", a3: "要。頭期款會直接加到可負擔房價上，自備款越多可負擔的總價越高，同時降低每月房貸與利息支出。",
    q4: "什麼時候應該調低房價區間？", a4: "若月供超過收入的三成、緊急預備金不足、或利率可能上升，通常應調低房價區間或增加自備款，降低財務壓力。",
    q5: "可負擔房價越高越好嗎？", a5: "不一定。買到負擔上限會壓縮其他生活與儲蓄空間；在可負擔範圍內保留彈性，長期財務反而更穩健。",
    q6: "這個工具能取代貸款核准嗎？", a6: "不能。它只是教育與規劃用估算；實際貸款核准仍取決於信用評分、收入證明、銀行政策與房屋鑑價。",
  },
  en: {
    badge: "Finance · Home affordability · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Affordability Calculator", subtitle: "Estimate the home price and monthly payment you can afford from income, debt, and rate",
    intro: "This tool turns monthly income, existing debt, down payment, mortgage rate, and term into an affordable home price and monthly mortgage cost — so you can set a realistic budget before house hunting.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates affordable price using common debt-to-income ratios and rates. It does not include taxes, insurance, HOA fees, maintenance, or changing living costs.",
    quickActionCard: "Quick example", tryExample: "Try an affordability example", examplePreview: "Affordable price", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-income example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter income, debt, and rate", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own situation.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard household · $6k income", activeExample: "High-income household", flowDemo: "$6k · 6% rate", calculator: "Calculator",
    participants: "Monthly after-tax income ($)", averageHourlyRate: "Existing monthly debt ($)", durationHours: "Mortgage rate (%)", meetingsPerMonth: "Loan term (years)",
    resultCard: "Affordability result", unit: "Affordable price ($)", primaryValue: "Headline number", maintenanceTarget: "Affordable price ($)", actionTarget: "Monthly mortgage", estimatedTdee: "Affordable price", maintenance: "Affordable", fatLossTarget: "Monthly mortgage",
    meetingCost: "Affordable price", monthlyEquiv: "Monthly mortgage", weeklyEquiv: "Available payment", dailyEquiv: "Suggested down payment", effectiveHours: "Debt-to-income ratio",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band affordability matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your affordable price into common ranges. This is a planning reference, not loan approval or professional financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the affordability snapshot into an action plan", conversionNote: "L9 reflects your current results — affordable price, monthly mortgage, and down payment — to help you decide whether to adjust the price range or increase the down payment.",
    progressInsight: "Progress insight", possibleTarget: "Your current affordability plan", dailyGap: "Suggested down payment", weeklyTrend: "Affordable price", motivation: "Motivation", keepMomentum: "Move from a snapshot to a steady home-buying plan",
    saveShareJourney: "Save / share", journeyTitle: "Take today's affordability snapshot home", journeyHint: "Recalculate whenever your income, debt, or rate changes — and track how affordable price and payment move.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Mortgage Calculator to estimate the actual monthly principal and interest", nextActionItem2: "Use Loan Calculator to compare total interest across rates and terms", nextActionItem3: "Use Debt Payoff Calculator to see how existing debt affects affordability",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Affordability → Mortgage → Loan compare → Retirement", bmrStep: "Affordability", deficitStep: "Mortgage", trendStep: "Loan compare", mealStep: "Retirement",
    knowledge: "Knowledge", knowledgeTitle: "What home affordability means in financial planning", definition: "Definition", definitionText: "Home affordability converts income, debt, and rate into an affordable home price. Buyers use it to set a realistic budget before house hunting and avoid an overly heavy monthly payment.",
    formula: "Formula", formulaText: "Available payment = monthly income × DTI cap − existing debt. Affordable principal = available payment ÷ monthly rate factor. Affordable price = affordable principal + down payment.",
    limitations: "Limitations", limitationsText: "This tool estimates affordable price only. It does not include property tax, insurance, HOA fees, maintenance, rate changes, or shifts in household spending.",
    interpretation: "Interpretation", interpretationText: "A high affordable price does not mean you should buy at the limit; keeping a buffer reduces risk from rising rates or income swings. What matters is whether the payment-to-income ratio stays healthy.",
    context: "Context", contextText: "Read affordability together with an emergency fund, life plans, and future income outlook — not just a single affordable ceiling.",
    example: "Example", exampleText: "Monthly after-tax income $6,000, existing debt $500, rate 6%, term 30 years, down payment $40,000. Available payment is about $1,660, affordable price about $317,000.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for affordability planning", premiumTitle: "Pro Affordability Toolkit", premiumText: "Unlock affordability trends, rate-scenario comparisons, down-payment planning, and household home-buying budget reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for a loan advisor or professional financial planning.", relatedTools: "Related tools", relatedToolsText: "Mortgage Calculator · Loan Calculator · Debt Payoff Calculator · Retirement Calculator", references: "References", referencesText: "Common mortgage debt-to-income guidelines; lender affordability guides; personal finance budgeting research; real-estate affordability reports.",
    q1: "Should I look at the affordable ceiling or a conservative value?", a1: "Use a conservative value. The affordable ceiling is a limit; keeping a buffer helps you handle rising rates, income swings, and unexpected costs, keeping finances safer.",
    q2: "What debt-to-income ratio should I use?", a2: "A common guideline is housing cost under 28% of income, and total debt under 36%. This tool estimates the available payment using that rule by default.",
    q3: "Should I include the down payment?", a3: "Yes. The down payment adds directly to affordable price — a larger down payment raises the affordable total while lowering the monthly mortgage and interest.",
    q4: "When should I lower the price range?", a4: "If the payment exceeds 30% of income, the emergency fund is thin, or rates may rise, you should usually lower the price range or increase the down payment to reduce financial stress.",
    q5: "Is a higher affordable price always better?", a5: "Not necessarily. Buying at the limit squeezes other living and savings room; keeping flexibility within budget is healthier for long-term finances.",
    q6: "Can this tool replace loan approval?", a6: "No. It is an educational and planning estimate. Real loan approval still depends on credit score, income verification, lender policy, and home appraisal.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function AffordabilityCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("6000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("500");
  const [durationHours, setDurationHours] = useState("6");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("30");
  const t = ui[lang];

  const DTI_CAP = 0.36;
  const DOWN_PAYMENT = 40000;

  const result = useMemo(() => {
    const income = Number(participants) || 0;
    const debt = Number(averageHourlyRate) || 0;
    const rate = Number(durationHours) || 0;
    const years = Number(meetingsPerMonth) || 0;
    const availablePayment = Math.max(0, income * DTI_CAP - debt);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const factor = monthlyRate > 0 ? (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1) : (months > 0 ? 1 / months : 0);
    const affordablePrincipal = factor > 0 ? availablePayment / factor : 0;
    const affordablePrice = affordablePrincipal + DOWN_PAYMENT;
    const dtiRatio = income > 0 ? (availablePayment + debt) / income * 100 : 0;
    return { availablePayment, affordablePrincipal, affordablePrice, dtiRatio, downPayment: DOWN_PAYMENT };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.affordablePrice, 0);
  const monthlyDisplay = fmt(result.availablePayment, 0);

  function fillSolid() { setUnit("metric"); setParticipants("6000"); setAverageHourlyRate("500"); setDurationHours("6"); setMeetingsPerMonth("30"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("12000"); setAverageHourlyRate("800"); setDurationHours("5.5"); setMeetingsPerMonth("30"); }

  const activeBand = bands.find(b => {
    const r = result.affordablePrice;
    if (r < 150000) return b.key === "tiny";
    if (r < 300000) return b.key === "normal";
    if (r < 500000) return b.key === "notable";
    if (r < 750000) return b.key === "high";
    if (r < 1000000) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#dcfce7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "可負擔房價" : "Affordable price"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$317k</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "月收入 $6k · 利率 6%" : "$6k income · 6% rate"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$650k</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "月收入 $12k · 利率 5.5%" : "$12k income · 5.5% rate"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/月" : "/month"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "可用月供" : "Payment"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.availablePayment, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/月" : "/month"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "自備款" : "Down pmt"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.downPayment, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "頭期" : "down"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "DTI" : "DTI"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.dtiRatio, 0)}%</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "負債比" : "ratio"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="affordability-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "可負擔" : "Affordable"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${fmt(result.downPayment, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "負擔" : "Afford", note: t.bmrStep }, { label: lang === "zh" ? "房貸" : "Mortgage", note: t.deficitStep }, { label: lang === "zh" ? "貸款" : "Loan", note: t.trendStep }, { label: lang === "zh" ? "退休" : "Retire", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="affordability-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["趨勢", "比較", "情境", "報告"] : ["Trends", "Compare", "Scenario", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
