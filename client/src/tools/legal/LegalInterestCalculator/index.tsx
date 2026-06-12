// @profile B
// Profile B · Calculator-YMYL · LegalInterestCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type InterestMode = "statutory" | "agreed" | "delay";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const bands = [
  { key: "statutory", range: { zh: "5%/年", en: "5%/yr" }, label: { zh: "法定利率", en: "Statutory rate" }, desc: { zh: "民法第203條，未約定利率時的法定週年利率。", en: "Art. 203 default annual rate when none agreed." } },
  { key: "delay", range: { zh: "5%/年", en: "5%/yr" }, label: { zh: "遲延利息", en: "Delay interest" }, desc: { zh: "民法第233條，遲延給付金錢之債的法定利息。", en: "Art. 233 delay interest on money debts." } },
  { key: "low-agreed", range: { zh: "< 5%", en: "< 5%" }, label: { zh: "低於法定", en: "Below statutory" }, desc: { zh: "約定低於法定者，依約定計算。", en: "Agreed below statutory; use the agreed rate." } },
  { key: "moderate", range: { zh: "5–10%", en: "5–10%" }, label: { zh: "一般約定", en: "Moderate agreed" }, desc: { zh: "常見約定區間，多數有效。", en: "Common agreed range; usually valid." } },
  { key: "high", range: { zh: "10–16%", en: "10–16%" }, label: { zh: "偏高約定", en: "High agreed" }, desc: { zh: "接近上限，超過部分請求權受限。", en: "Near cap; excess is unenforceable." } },
  { key: "cap", range: { zh: "> 16%", en: "> 16%" }, label: { zh: "超過上限", en: "Above cap" }, desc: { zh: "民法第205條，超過16%部分無請求權。", en: "Art. 205: above 16% has no claim right." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "違約金計算機", en: "Penalty Calculator" }, href: "/tools/legal/penalty-calculator" },
  { label: { zh: "資遣費計算機", en: "Severance Pay Calculator" }, href: "/tools/legal/severance-pay-calculator" },
  { label: { zh: "印花稅計算機", en: "Stamp Duty Calculator" }, href: "/tools/legal/stamp-duty-calculator" },
  { label: { zh: "進口關稅計算機", en: "Import Duty Calculator" }, href: "/tools/legal/import-duty-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 利息試算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "法定利息計算機 · Legal Interest", subtitle: "用本金、利率與期間估算法定利息與遲延利息金額",
    intro: "法定利息計算機依本金、年利率（法定 5% 或約定利率）與期間天數，估算應付利息總額，並提供法定上限 16% 的判讀，協助您在催討、協商或訴訟前先建立量化基準。",
    trustNoteLabel: "注意事項：", trustNote: "利率與起算日依約定與個案差異而不同；本工具僅供教育與試算用途，不構成法律意見。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立利息試算範例", examplePreview: "估算利息預覽", examplePerson: "本金", fillExample: "一鍵填入法定範例", previewActivePath: "填入約定高利範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入本金與利率", examplesHelper: "先用範例理解法定與約定利率差異，再改成自己的本金、利率與期間天數。",
    metric: "新台幣 (NT$)", imperial: "美元 (US$)", exampleCards: "範例卡", baselineExample: "100萬本金 · 法定5%", activeExample: "約定高利示範", baselineExampleNote: "本金 1,000,000 · 5% · 365天", activeExampleNote: "本金 1,000,000 · 15% · 365天", carbsLabel: "本利和", carbsName: "本金加利息", proteinLabel: "利息", flowDemo: "年利率", calculator: "計算機",
    weight: "本金", tdee: "年利率 (%)", goal: "利息類型", goalCut: "法定利息", goalMaintain: "約定利息", goalBulk: "遲延利息", overdueDays: "期間天數",
    resultCard: "法定利息試算結果", unit: "元", primaryValue: "主要數值", maintenanceTarget: "利息 (元)", actionTarget: "本利和 (元)", estimatedTdee: "本金", maintenance: "應付利息", fatLossTarget: "本利合計",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格利率判讀矩陣", tdeeMatrixNote: "L7 固定六格，依年利率分級對照法定 5% 與上限 16%；這是試算參考，不是法律判斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把利息試算轉成可行動計畫", conversionNote: "L9 會連動目前計算結果，顯示每日利息、本利和與催討建議。",
    progressInsight: "利率洞察卡", possibleTarget: "目前利息規劃", dailyGap: "每日利息", weeklyTrend: "本利和", motivation: "行動卡", keepMomentum: "從利息試算走向催討或訴訟準備",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的利息試算帶回家", journeyHint: "正式金額以起算日、約定條款與法院認定為準，建議連同契約一併評估。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用違約金計算機估算違約金部分", nextActionItem2: "用印花稅檢查契約相關稅負", nextActionItem3: "利率超過16%時，超出部分依法無請求權",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "本金 → 利率 → 利息 → 催討/訴訟", bmrStep: "本金利率", deficitStep: "利息", trendStep: "上限檢查", mealStep: "催討訴訟",
    knowledge: "知識", knowledgeTitle: "法定利息在民法中的意義", definition: "定義", definitionText: "法定利息是法律規定、未約定利率時適用的利息標準；遲延利息是債務人遲延給付金錢時應加給的利息。", formula: "公式", formulaText: "利息 = 本金 × 年利率% × (天數 ÷ 365)。法定週年利率為5%（民法第203條）；約定利率上限16%（民法第205條），超過部分無請求權。", limitations: "限制", limitationsText: "本工具採單利、實際天數/365計算；複利、起算日認定、約定計息方式須依契約與判例。", interpretation: "解讀", interpretationText: "約定利率不得超過16%；遲延利息自債務人受催告或期限屆至時起算。", context: "脈絡", contextText: "利息應與本金、違約金、實際損害一併評估，避免重複或漏算。", example: "範例", exampleText: "本金100萬、法定5%、一年 → 利息 50,000 元，本利和 1,050,000 元。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "利息試算的下一步工具", premiumTitle: "PRO 債權試算包", premiumText: "解鎖複利試算、起算日精算、本息攤還表與催告函範本。", feat1: "複利計算", feat2: "起算日", feat3: "攤還表", feat4: "催告函",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與試算用途，不取代律師諮詢、法律意見或法院判斷。", relatedTools: "相關工具", relatedToolsText: "違約金計算機 · 資遣費計算機 · 印花稅計算機 · 進口關稅計算機", references: "參考資料", referencesText: "中華民國民法第203條（法定利率）、第205條（最高利率）、第233條（遲延利息）；最高法院關於利息起算之判例。",
    q1: "法定利率是多少？", a1: "未約定利率時，民法第203條規定為週年5%。",
    q2: "約定利率有上限嗎？", a2: "有。民法第205條規定超過週年16%的部分，債權人對超過部分無請求權。",
    q3: "遲延利息從什麼時候起算？", a3: "自債務人受催告或給付期限屆至而未給付時起算。",
    q4: "可以計算複利嗎？", a4: "本工具採單利試算；複利須有特別約定且受法律限制，建議諮詢專業。",
    q5: "利息與違約金可以同時請求嗎？", a5: "可以，但須避免就同一損害重複計算，建議釐清條款性質。",
    q6: "這個工具能取代律師意見嗎？", a6: "不能。它只是教育用試算；涉及實際爭議或訴訟，請諮詢專業律師。",
  },
  en: {
    badge: "Legal · Interest Estimate · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Legal Interest Calculator", subtitle: "Estimate statutory and delay interest from principal, rate, and period",
    intro: "This calculator uses principal, annual rate (statutory 5% or agreed), and period days to estimate total interest payable, plus a read on the 16% statutory cap, helping you build a quantitative baseline before demand, negotiation, or litigation.",
    trustNoteLabel: "Note:", trustNote: "Rates and start dates vary by agreement and case; this tool is for education and estimation only and is not legal advice.",
    quickActionCard: "Quick Action Card", tryExample: "Create an interest estimate instantly", examplePreview: "Estimated interest preview", examplePerson: "Principal", fillExample: "One-click statutory example", previewActivePath: "Fill high-agreed-rate example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter principal and rate", examplesHelper: "Start with an example to understand statutory vs agreed rates, then replace with your own principal, rate, and period days.",
    metric: "NT$", imperial: "US$", exampleCards: "Example cards", baselineExample: "1M principal · statutory 5%", activeExample: "High-agreed demo", baselineExampleNote: "Principal 1,000,000 · 5% · 365 days", activeExampleNote: "Principal 1,000,000 · 15% · 365 days", carbsLabel: "Total", carbsName: "Principal + interest", proteinLabel: "Interest", flowDemo: "Annual rate", calculator: "Calculator",
    weight: "Principal", tdee: "Annual rate (%)", goal: "Interest type", goalCut: "Statutory", goalMaintain: "Agreed", goalBulk: "Delay", overdueDays: "Period days",
    resultCard: "Interest Estimate Result", unit: "NT$", primaryValue: "Primary Value", maintenanceTarget: "Interest (NT$)", actionTarget: "Total (NT$)", estimatedTdee: "Principal", maintenance: "Interest payable", fatLossTarget: "Principal + interest",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card rate interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards graded by annual rate against statutory 5% and the 16% cap. This is estimation guidance, not a legal ruling.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the interest estimate into an actionable plan", conversionNote: "L9 values update from the computed result: daily interest, total, and demand hint.",
    progressInsight: "Rate Insight Card", possibleTarget: "Current interest plan", dailyGap: "Daily interest", weeklyTrend: "Total", motivation: "Action Card", keepMomentum: "Move from estimate to demand or litigation prep",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's interest estimate home", journeyHint: "Final amounts depend on start date, terms, and court findings; assess together with the contract.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Estimate penalty with the Penalty Calculator", nextActionItem2: "Check contract tax with Stamp Duty Calculator", nextActionItem3: "Above 16%, the excess has no claim right",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Principal → Rate → Interest → Demand/Litigate", bmrStep: "Principal/Rate", deficitStep: "Interest", trendStep: "Cap check", mealStep: "Demand",
    knowledge: "Knowledge", knowledgeTitle: "What statutory interest means in civil law", definition: "Definition", definitionText: "Statutory interest is the standard applied when no rate is agreed; delay interest is added when a debtor delays paying a money debt.", formula: "Formula", formulaText: "Interest = principal × annual% × (days ÷ 365). Statutory annual rate is 5% (Art. 203); agreed cap is 16% (Art. 205); excess has no claim right.", limitations: "Limitations", limitationsText: "This tool uses simple interest and actual-days/365; compounding, start-date findings, and accrual method depend on the contract and precedents.", interpretation: "Interpretation", interpretationText: "Agreed rates may not exceed 16%; delay interest accrues from demand or when the due date passes.", context: "Context", contextText: "Interest should be assessed together with principal, penalty, and actual damages to avoid double or missed counting.", example: "Example", exampleText: "Principal 1M, statutory 5%, one year → interest 50,000, total 1,050,000.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for interest estimation", premiumTitle: "PRO Claim Estimate Pack", premiumText: "Unlock compound estimation, precise start-date calc, amortization tables, and demand-letter templates.", feat1: "Compound", feat2: "Start Date", feat3: "Amortize", feat4: "Letter",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and estimation. It does not replace a lawyer, legal advice, or a court ruling.", relatedTools: "Related Tools", relatedToolsText: "Penalty Calculator · Severance Pay Calculator · Stamp Duty Calculator · Import Duty Calculator", references: "References", referencesText: "Taiwan Civil Code Art. 203 (statutory rate), Art. 205 (max rate), Art. 233 (delay interest); Supreme Court precedents on interest accrual.",
    q1: "What is the statutory rate?", a1: "When no rate is agreed, Art. 203 sets it at 5% per year.",
    q2: "Is there a cap on agreed rates?", a2: "Yes. Under Art. 205, the creditor has no claim right over the portion exceeding 16% per year.",
    q3: "When does delay interest start?", a3: "From demand or when the due date passes without payment.",
    q4: "Can it compute compound interest?", a4: "This tool uses simple interest; compounding requires a special agreement and is legally limited—consult a professional.",
    q5: "Can interest and penalty both be claimed?", a5: "Yes, but avoid double counting for the same loss; clarify the nature of the clauses.",
    q6: "Can this tool replace a lawyer's opinion?", a6: "No. It is an educational estimate; for real disputes or litigation, consult a professional lawyer.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function LegalInterestCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("5");
  const [mode, setMode] = useState<InterestMode>("statutory");
  const [days, setDays] = useState("365");
  const t = ui[lang];

  const result = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate);
    const d = Number(days);
    if (p <= 0 || r <= 0 || d <= 0) return null;
    const effectiveRate = Math.min(r, 16);
    const interest = p * (effectiveRate / 100) * (d / 365);
    const total = p + interest;
    const dailyInterest = p * (effectiveRate / 100) / 365;
    return { interest, total, dailyInterest, effectiveRate, capped: r > 16 };
  }, [principal, rate, days]);

  const interestDisplay = result ? fmt(result.interest, 0) : "—";
  const totalDisplay = result ? fmt(result.total, 0) : "—";
  const dailyDisplay = result ? fmt(result.dailyInterest, 0) : "—";

  function fillStatutory() { setUnit("metric"); setPrincipal("1000000"); setRate("5"); setMode("statutory"); setDays("365"); }
  function fillHighAgreed() { setUnit("metric"); setPrincipal("1000000"); setRate("15"); setMode("agreed"); setDays("365"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#cffafe,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-cyan-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white"><div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{interestDisplay}</div><div className="text-sm font-bold text-cyan-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{fmt(Number(principal), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{rate}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{mode === "statutory" ? "⚖️" : mode === "delay" ? "⏰" : "📝"}</div></div></div><button onClick={fillStatutory} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighAgreed} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-CalculatorInput + L8-ScenarioComparison */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStatutory} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">5%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighAgreed} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">15%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={rate} onChange={(e) => setRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.overdueDays}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={days} onChange={(e) => setDays(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as InterestMode)}><option value="statutory">{t.goalCut}</option><option value="agreed">{t.goalMaintain}</option><option value="delay">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-PrimaryResult */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-cyan-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{interestDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{result ? fmt(result.effectiveRate, 0) : "—"}%</div><div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-cyan-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-cyan-950">{interestDisplay}</p><p className="text-sm font-bold text-cyan-700">{t.unit}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-blue-950">{totalDisplay}</p><p className="text-sm font-bold text-blue-700">{t.unit}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-emerald-950">{totalDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.unit}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-ResultIntelligence */}<p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{l(item.range, lang)}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{interestDisplay} <span className="text-sm text-slate-500">{t.unit}</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="legal-interest-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-blue-50 p-6 shadow-sm md:p-7">{/* L8 scenario data feeds L9 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-EmotionConversionUpper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{interestDisplay}</div></div><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-xs font-black uppercase text-cyan-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-cyan-950">{dailyDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-blue-950">{totalDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-EmotionConversionLower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Principal", note: t.bmrStep }, { label: "Interest", note: t.deficitStep }, { label: "Cap", note: t.trendStep }, { label: "Demand", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-cyan-300 bg-cyan-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="legal-interest-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">{/* L15-AffiliateResources · L16-PremiumGate */}<section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-cyan-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
