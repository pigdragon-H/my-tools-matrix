// @profile B
// Profile B · 計算機-YMYL · AssetDepreciation計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<$500/yr", label: { zh: "極低", en: "Minimal" }, desc: { zh: "年折舊極低，資產價值穩定或使用年限很長。", en: "Annual depreciation is minimal — value is stable or the useful life is long." } },
  { key: "normal", range: "$500-2k/yr", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見的年折舊範圍，適合多數設備與器材。", en: "A common annual depreciation range for most equipment and gear." } },
  { key: "notable", range: "$2k-5k/yr", label: { zh: "顯著", en: "Notable" }, desc: { zh: "年折舊開始顯著，記帳時應留意帳面價值下降。", en: "Annual depreciation is becoming notable — track the falling book value." } },
  { key: "high", range: "$5k-10k/yr", label: { zh: "偏高", en: "High" }, desc: { zh: "高折舊資產，建議搭配維修與汰換規劃。", en: "High-depreciation asset — pair it with maintenance and replacement planning." } },
  { key: "major", range: "$10k-25k/yr", label: { zh: "重大", en: "Major" }, desc: { zh: "重大折舊，常見於車輛、產線或大型設備。", en: "Major depreciation — common for vehicles, lines, or large equipment." } },
  { key: "executive", range: ">$25k/yr", label: { zh: "鉅額", en: "Substantial" }, desc: { zh: "鉅額年折舊，必須對應明確的攤提與稅務策略。", en: "Substantial annual depreciation — must match a clear amortization and tax strategy." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "汽車折舊計算機", en: "Car Depreciation Calculator" }, href: "/tools/finance/car-depreciation-calculator" },
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "投資報酬計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-payback-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 資產折舊 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Asset Depreciation Calculator · 資產折舊計算機", subtitle: "依原始成本、殘值與年限估算年折舊與帳面價值",
    intro: "本工具根據資產原始成本、殘值、預估使用年限與已使用年數，以直線法估算每年折舊金額與目前帳面價值，幫助你做記帳、汰換與稅務規劃。",
    trustNoteLabel: "注意事項：", trustNote: "此工具採直線折舊法估算；未計入加速折舊、稅法差異、減損或資產重估，實際入帳請以會計與稅務規定為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立資產折舊範例", examplePreview: "年折舊預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入大型設備範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入原始成本、殘值與年限", examplesHelper: "先用範例理解直線折舊計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "辦公設備 · $10k", activeExample: "大型設備", flowDemo: "$10k · 5 年", calculator: "計算機",
    participants: "原始成本 ($)", averageHourlyRate: "殘值 ($)", durationHours: "使用年限 (年)", meetingsPerMonth: "已使用年數 (年)",
    resultCard: "資產折舊計算結果", unit: "年折舊 ($)", primaryValue: "主要數值", maintenanceTarget: "年折舊 ($)", actionTarget: "帳面價值", estimatedTdee: "年折舊", maintenance: "年折舊", fatLossTarget: "帳面價值",
    meetingCost: "年折舊", monthlyEquiv: "帳面價值", weeklyEquiv: "月折舊", dailyEquiv: "累計折舊", effectiveHours: "剩餘年限",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格資產折舊判讀矩陣", tdeeMatrixNote: "L7 固定六格，將年折舊金額放進常見區間；這是記帳參考，不是稅務或會計建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把資產折舊盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示年折舊、帳面價值與累計折舊，協助判斷是否該汰換、維修或調整攤提年限。",
    progressInsight: "進度洞察卡", possibleTarget: "目前資產折舊計畫", dailyGap: "累計折舊", weeklyTrend: "年折舊", motivation: "動力卡", keepMomentum: "從折舊盤點走向穩定資產管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的資產折舊盤點帶回家", journeyHint: "每次新增資產、調整年限或殘值時重新計算，追蹤帳面價值的變化。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用汽車折舊計算機估算車輛的逐年貶值", nextActionItem2: "用投資報酬計算機評估設備投資的回收期", nextActionItem3: "用淨資產計算機把折舊後的資產納入整體財務",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "資產折舊 → 汽車折舊 → 投資報酬 → 淨資產", bmrStep: "資產折舊", deficitStep: "汽車折舊", trendStep: "投資報酬", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "資產折舊在財務管理中的意義", definition: "定義", definitionText: "資產折舊是把資產成本依使用年限分攤到每年費用，反映資產價值隨時間下降，常用於記帳、稅務攤提與汰換決策。",
    formula: "公式", formulaText: "直線年折舊 = (原始成本 − 殘值) ÷ 使用年限。累計折舊 = 年折舊 × 已使用年數。帳面價值 = 原始成本 − 累計折舊。",
    limitations: "限制", limitationsText: "本工具只採直線折舊法；未納入加速折舊、稅法差異、資產減損、重估與市場價值波動。",
    interpretation: "解讀", interpretationText: "年折舊高代表資產耗用快或年限短；帳面價值接近殘值時，通常是評估汰換或維修的時機。關鍵是攤提是否反映真實使用。",
    context: "脈絡", contextText: "資產折舊應搭配維修成本、汰換週期與稅務攤提一起看，而不是只看單一年折舊金額。",
    example: "範例", exampleText: "原始成本 $10,000、殘值 $1,000、使用年限 5 年、已使用 2 年。年折舊 = $1,800，累計折舊 = $3,600，帳面價值 = $6,400。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "資產折舊規劃的下一步工具", premiumTitle: "專業版資產折舊治理包", premiumText: "解鎖加速折舊法、多資產組合、稅務攤提情境與資產汰換報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代會計師或專業稅務顧問。", relatedTools: "相關工具", relatedToolsText: "汽車折舊計算機 · 貸款計算機 · 投資報酬計算機 · 淨資產計算機", references: "參考資料", referencesText: "一般公認會計原則折舊準則；直線折舊法說明；企業資產管理指引；稅務攤提研究。",
    q1: "直線折舊和加速折舊差在哪？", a1: "直線折舊每年攤提相同金額，簡單穩定；加速折舊前期攤提較多，反映資產早期耗用快。本工具預設採直線折舊。",
    q2: "殘值要怎麼估？", a2: "殘值是資產用到年限結束時的預估變現價值。可參考二手市場行情或公司政策，若難以估算，保守做法是設為零。",
    q3: "帳面價值可以是負的嗎？", a3: "不會。帳面價值最低就是殘值。當累計折舊達到原始成本減殘值時，折舊即停止，帳面價值維持在殘值。",
    q4: "什麼時候該汰換資產？", a4: "當維修成本逐年上升、帳面價值接近殘值、或新設備能顯著提升效率時，通常是評估汰換的時機。",
    q5: "折舊金額越高越好嗎？", a5: "不一定。高折舊代表資產耗用快，雖可分攤較多費用，但也意味更頻繁的汰換成本，需與使用效益一起評估。",
    q6: "這個工具能取代正式記帳嗎？", a6: "不能。它只是教育與規劃用估算；實際入帳仍須依會計準則、稅法與公司政策，並由專業會計處理。",
  },
  en: {
    badge: "Finance · Asset depreciation · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Asset Depreciation Calculator", subtitle: "Estimate annual depreciation and book value from cost, salvage, and life",
    intro: "This tool turns original cost, salvage value, estimated useful life, and years used into an annual depreciation amount and current book value using the straight-line method — for bookkeeping, replacement, and tax planning.",
    trustNoteLabel: "Note:", trustNote: "This tool uses the straight-line method. It does not include accelerated depreciation, tax-law differences, impairment, or revaluation — follow accounting and tax rules for actual entries.",
    quickActionCard: "Quick example", tryExample: "Try a depreciation example", examplePreview: "Annual depreciation", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the large-equipment example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter cost, salvage, and life", examplesHelper: "Start from an example to understand the straight-line math, then change the numbers to match your own asset.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Office equipment · $10k", activeExample: "Large equipment", flowDemo: "$10k · 5 years", calculator: "Calculator",
    participants: "Original cost ($)", averageHourlyRate: "Salvage value ($)", durationHours: "Useful life (years)", meetingsPerMonth: "Years used (years)",
    resultCard: "Depreciation result", unit: "Annual depreciation ($)", primaryValue: "Headline number", maintenanceTarget: "Annual depreciation ($)", actionTarget: "Book value", estimatedTdee: "Annual depreciation", maintenance: "Per year", fatLossTarget: "Book value",
    meetingCost: "Annual depreciation", monthlyEquiv: "Book value", weeklyEquiv: "Monthly depreciation", dailyEquiv: "Accumulated depreciation", effectiveHours: "Remaining life",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band depreciation matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your annual depreciation into common ranges. This is a bookkeeping reference, not tax or accounting advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the depreciation snapshot into an action plan", conversionNote: "L9 reflects your current results — annual depreciation, book value, and accumulated depreciation — to help you decide whether to replace, maintain, or adjust the amortization life.",
    progressInsight: "Progress insight", possibleTarget: "Your current depreciation plan", dailyGap: "Accumulated depreciation", weeklyTrend: "Annual depreciation", motivation: "Motivation", keepMomentum: "Move from a snapshot to steady asset management",
    saveShareJourney: "Save / share", journeyTitle: "Take today's depreciation snapshot home", journeyHint: "Recalculate whenever you add an asset or adjust life or salvage — and track how book value moves.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Car Depreciation Calculator to estimate a vehicle's yearly value loss", nextActionItem2: "Use ROI Calculator to assess the payback period of equipment investment", nextActionItem3: "Use Net Worth Calculator to fold depreciated assets into overall finances",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Depreciation → Car depreciation → ROI → Net worth", bmrStep: "Depreciation", deficitStep: "Car depreciation", trendStep: "ROI", mealStep: "Net worth",
    knowledge: "Knowledge", knowledgeTitle: "What asset depreciation means in financial management", definition: "Definition", definitionText: "Depreciation spreads an asset's cost over its useful life as a yearly expense, reflecting how value falls over time. It is used for bookkeeping, tax amortization, and replacement decisions.",
    formula: "Formula", formulaText: "Straight-line annual depreciation = (original cost − salvage) ÷ useful life. Accumulated depreciation = annual depreciation × years used. Book value = original cost − accumulated depreciation.",
    limitations: "Limitations", limitationsText: "This tool uses the straight-line method only. It does not include accelerated depreciation, tax-law differences, impairment, revaluation, or market-value swings.",
    interpretation: "Interpretation", interpretationText: "High annual depreciation means fast usage or a short life; when book value nears salvage, it is usually time to evaluate replacement or maintenance. What matters is whether amortization reflects real usage.",
    context: "Context", contextText: "Read depreciation together with maintenance cost, replacement cycle, and tax amortization — not just a single annual figure.",
    example: "Example", exampleText: "Original cost $10,000, salvage $1,000, useful life 5 years, 2 years used. Annual depreciation = $1,800, accumulated = $3,600, book value = $6,400.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for depreciation planning", premiumTitle: "Pro Depreciation Toolkit", premiumText: "Unlock accelerated methods, multi-asset portfolios, tax-amortization scenarios, and asset-replacement reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for an accountant or professional tax advisor.", relatedTools: "Related tools", relatedToolsText: "Car Depreciation Calculator · Loan Calculator · ROI Calculator · Net Worth Calculator", references: "References", referencesText: "GAAP depreciation guidelines; straight-line method notes; enterprise asset management guides; tax amortization research.",
    q1: "What's the difference between straight-line and accelerated depreciation?", a1: "Straight-line spreads the same amount each year — simple and stable; accelerated front-loads expense to reflect faster early usage. This tool uses straight-line by default.",
    q2: "How do I estimate salvage value?", a2: "Salvage value is the estimated resale value at the end of useful life. Use second-hand market prices or company policy; if hard to estimate, setting it to zero is conservative.",
    q3: "Can book value be negative?", a3: "No. Book value bottoms out at salvage value. Once accumulated depreciation reaches cost minus salvage, depreciation stops and book value stays at salvage.",
    q4: "When should I replace an asset?", a4: "When maintenance cost rises year over year, book value nears salvage, or newer equipment clearly boosts efficiency — that is usually the time to evaluate replacement.",
    q5: "Is higher depreciation always better?", a5: "Not necessarily. High depreciation means fast usage; while it spreads more expense, it also implies more frequent replacement cost, so weigh it against the usage benefit.",
    q6: "Can this tool replace formal bookkeeping?", a6: "No. It is an educational and planning estimate. Actual entries must follow accounting standards, tax law, and company policy, handled by a professional accountant.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function AssetDepreciation() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("10000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("1000");
  const [durationHours, setDurationHours] = useState("5");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("2");
  const t = ui[lang];

  const result = useMemo(() => {
    const cost = Number(participants) || 0;
    const salvage = Number(averageHourlyRate) || 0;
    const life = Number(durationHours) || 0;
    const yearsUsed = Number(meetingsPerMonth) || 0;
    const depreciableBase = Math.max(0, cost - salvage);
    const annualDep = life > 0 ? depreciableBase / life : 0;
    const monthlyDep = annualDep / 12;
    const cappedYears = Math.min(yearsUsed, life);
    const accumulated = Math.min(depreciableBase, annualDep * cappedYears);
    const bookValue = cost - accumulated;
    const remainingLife = Math.max(0, life - yearsUsed);
    return { annualDep, monthlyDep, accumulated, bookValue, remainingLife };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.annualDep, 0);
  const monthlyDisplay = fmt(result.bookValue, 0);

  function fillSolid() { setUnit("metric"); setParticipants("10000"); setAverageHourlyRate("1000"); setDurationHours("5"); setMeetingsPerMonth("2"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("60000"); setAverageHourlyRate("8000"); setDurationHours("6"); setMeetingsPerMonth("2"); }

  const activeBand = bands.find(b => {
    const r = result.annualDep;
    if (r < 500) return b.key === "tiny";
    if (r < 2000) return b.key === "normal";
    if (r < 5000) return b.key === "notable";
    if (r < 10000) return b.key === "high";
    if (r < 25000) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fee2e2,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每年折舊" : "Per year"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$1,800</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$10k · 5 年" : "$10k · 5 years"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$8,667</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$60k · 6 年" : "$60k · 6 years"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "/年" : "/yr"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "帳面" : "book"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "月折舊" : "Monthly"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.monthlyDep, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/月" : "/month"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "累計" : "Accum"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.accumulated, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "折舊" : "dep"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "剩餘" : "Left"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.remainingLife, 0)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "年" : "yr"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="asset-depreciation-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "年折舊" : "Annual"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${fmt(result.accumulated, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "折舊" : "Depreciate", note: t.bmrStep }, { label: lang === "zh" ? "車輛" : "Car", note: t.deficitStep }, { label: lang === "zh" ? "報酬" : "ROI", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="asset-depreciation-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["加速法", "組合", "情境", "報告"] : ["Accel", "Portfolio", "Scenario", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
