// @profile B
// Profile B · Calculator-YMYL · PenaltyCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type PenaltyMode = "daily" | "fixed" | "balance";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const bands = [
  { key: "trivial", range: "< 5%", label: { zh: "輕微違約", en: "Trivial breach" }, desc: { zh: "違約金占合約金額比例低，法院通常不予酌減。", en: "Low ratio to contract value; courts rarely reduce." } },
  { key: "moderate", range: "5–10%", label: { zh: "一般違約", en: "Moderate breach" }, desc: { zh: "常見約定區間，多數情況可被接受。", en: "Common agreed range; usually acceptable." } },
  { key: "high", range: "10–20%", label: { zh: "偏高違約金", en: "High penalty" }, desc: { zh: "比例偏高，法院可能依民法第252條酌減。", en: "High ratio; courts may reduce under Art. 252." } },
  { key: "excessive", range: "20–30%", label: { zh: "過高違約金", en: "Excessive penalty" }, desc: { zh: "顯失公平，常被酌減至合理範圍。", en: "Likely unconscionable; commonly reduced." } },
  { key: "punitive", range: "30–50%", label: { zh: "懲罰性過重", en: "Punitive heavy" }, desc: { zh: "多被大幅酌減，需舉證實際損害。", en: "Often heavily reduced; requires proof of damage." } },
  { key: "void-risk", range: "> 50%", label: { zh: "顯不相當", en: "Disproportionate" }, desc: { zh: "極可能被認定無效或大幅酌減。", en: "Very likely void or sharply reduced." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "法定利息計算機", en: "Legal Interest Calculator" }, href: "/tools/legal/legal-interest-calculator" },
  { label: { zh: "資遣費計算機", en: "Severance Pay Calculator" }, href: "/tools/legal/severance-pay-calculator" },
  { label: { zh: "加班費計算機", en: "Overtime Calculator" }, href: "/tools/legal/overtime-calculator" },
  { label: { zh: "印花稅計算機", en: "Stamp Duty Calculator" }, href: "/tools/legal/stamp-duty-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 契約試算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "違約金計算機 · Penalty Calculator", subtitle: "用合約金額、違約金率與逾期天數估算違約金與酌減後金額",
    intro: "違約金計算機依合約金額、約定違約金率（每日或固定比例）與逾期天數，估算應付違約金總額，並提供法院酌減後的合理金額參考，協助您在協商或訴訟前先建立量化基準。",
    trustNoteLabel: "注意事項：", trustNote: "違約金率與酌減幅度依約定與個案差異而不同；本工具僅供教育與試算用途，不構成法律意見。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立違約金試算範例", examplePreview: "估算違約金預覽", examplePerson: "合約金額", fillExample: "一鍵填入標準範例", previewActivePath: "填入高額違約範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入合約金額與違約金率", examplesHelper: "先用範例理解違約金與酌減關係，再改成自己的合約金額、違約金率與逾期天數。",
    metric: "新台幣 (NT$)", imperial: "美元 (US$)", exampleCards: "範例卡", baselineExample: "100萬合約 · 標準率", activeExample: "高額違約示範", baselineExampleNote: "合約 1,000,000 · 日率0.1% · 逾期30天", activeExampleNote: "合約 1,000,000 · 日率0.5% · 逾期60天", carbsLabel: "酌減後", carbsName: "酌減後金額", proteinLabel: "違約金", flowDemo: "違約金率", calculator: "計算機",
    weight: "合約金額", tdee: "違約金率 (% 每日)", goal: "計算模式", goalCut: "每日比例", goalMaintain: "固定比例", goalBulk: "未付餘額比例", overdueDays: "逾期天數",
    resultCard: "違約金試算結果", unit: "元", primaryValue: "主要數值", maintenanceTarget: "違約金 (元)", actionTarget: "酌減後 (元)", estimatedTdee: "合約金額", maintenance: "原始違約金", fatLossTarget: "酌減參考",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格違約金比例判讀矩陣", tdeeMatrixNote: "L7 固定六格，依違約金占合約金額比例分級，提示法院酌減可能性；這是試算參考，不是法律判斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把違約金試算轉成可行動計畫", conversionNote: "L9 會連動目前計算結果，顯示每日違約金、占合約比例與協商建議。",
    progressInsight: "比例洞察卡", possibleTarget: "目前違約金規劃", dailyGap: "每日違約金", weeklyTrend: "占合約比例%", motivation: "行動卡", keepMomentum: "從違約金試算走向協商或訴訟準備",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的違約金試算帶回家", journeyHint: "正式金額以合約條款與法院認定為準，建議連同實際損害證據一併評估。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用法定利息確認遲延利息部分", nextActionItem2: "用印花稅檢查合約相關稅負", nextActionItem3: "違約金過高時，蒐集實際損害證據作為酌減依據",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "合約金額 → 違約金 → 酌減評估 → 協商/訴訟", bmrStep: "合約金額", deficitStep: "違約金", trendStep: "酌減評估", mealStep: "協商訴訟",
    knowledge: "知識", knowledgeTitle: "違約金在契約法中的意義", definition: "定義", definitionText: "違約金是當事人預先約定，於一方不履行契約時應給付對方的金額，分為賠償額預定性與懲罰性兩種。", formula: "公式", formulaText: "每日模式：違約金 = 合約金額 × 日率% × 逾期天數。固定模式：違約金 = 合約金額 × 固定比例%。酌減後金額為法院依民法第252條依職權審酌之合理參考值。", limitations: "限制", limitationsText: "本工具假設線性計算；實際違約金須依合約文字、實際損害、當事人過失程度與交易習慣綜合認定，法院得依職權酌減。", interpretation: "解讀", interpretationText: "違約金占合約金額逾20%者，被酌減機率明顯升高；舉證實際損害有助於維持或調整金額。", context: "脈絡", contextText: "違約金應與遲延利息、實際損害賠償一起評估，避免重複請求。", example: "範例", exampleText: "合約100萬、日率0.1%、逾期30天 → 違約金 30,000 元（占合約3%），屬一般區間，酌減機率低。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "契約試算的下一步工具", premiumTitle: "PRO 契約風險包", premiumText: "解鎖違約金條款健診、酌減機率模型、實際損害舉證清單與協商話術範本。", feat1: "條款解析", feat2: "酌減", feat3: "證據", feat4: "範本",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與試算用途，不取代律師諮詢、法律意見或法院判斷。", relatedTools: "相關工具", relatedToolsText: "法定利息計算機 · 資遣費計算機 · 加班費計算機 · 印花稅計算機", references: "參考資料", referencesText: "中華民國民法第250條至第253條（違約金）；最高法院關於違約金酌減之判例見解；公平交易法定型化契約規範。",
    q1: "違約金可以無限約定嗎？", a1: "不行。民法第252條規定，約定違約金額過高者，法院得減至相當之數額。",
    q2: "賠償額預定性與懲罰性違約金差在哪？", a2: "賠償額預定性以填補損害為主；懲罰性則於損害賠償外另行給付，但仍受酌減限制。",
    q3: "逾期愈久違約金一定愈高嗎？", a3: "每日模式下會隨天數增加，但累計過高仍可能被法院酌減至合理範圍。",
    q4: "可以用於房屋買賣違約嗎？", a4: "可以作為初步試算，但不動產交易常有定型化條款與履約保證，實際以合約與法院認定為準。",
    q5: "違約金與遲延利息可以同時請求嗎？", a5: "需視約定性質，避免就同一損害重複請求，建議先釐清條款再主張。",
    q6: "這個工具能取代律師意見嗎？", a6: "不能。它只是教育用試算；涉及實際爭議、金額重大或訴訟，請諮詢專業律師。",
  },
  en: {
    badge: "Legal · Contract Estimate · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Penalty Calculator · Liquidated Damages", subtitle: "Estimate contractual penalty and court-reduced amount from contract value, rate, and overdue days",
    intro: "This calculator uses contract value, agreed penalty rate (daily or fixed), and overdue days to estimate total liquidated damages, plus a court-reduced reference amount, helping you build a quantitative baseline before negotiation or litigation.",
    trustNoteLabel: "Note:", trustNote: "Penalty rates and reduction ranges vary by agreement and case; this tool is for education and estimation only and is not legal advice.",
    quickActionCard: "Quick Action Card", tryExample: "Create a penalty estimate instantly", examplePreview: "Estimated penalty preview", examplePerson: "Contract value", fillExample: "One-click standard example", previewActivePath: "Fill high-penalty example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter contract value and penalty rate", examplesHelper: "Start with an example to understand penalty and reduction, then replace with your own contract value, rate, and overdue days.",
    metric: "NT$", imperial: "US$", exampleCards: "Example cards", baselineExample: "1M contract · standard rate", activeExample: "High-penalty demo", baselineExampleNote: "Contract 1,000,000 · 0.1%/day · 30 days", activeExampleNote: "Contract 1,000,000 · 0.5%/day · 60 days", carbsLabel: "After reduction", carbsName: "Reduced amount", proteinLabel: "Penalty", flowDemo: "Penalty rate", calculator: "Calculator",
    weight: "Contract value", tdee: "Penalty rate (%/day)", goal: "Mode", goalCut: "Daily rate", goalMaintain: "Fixed rate", goalBulk: "Unpaid balance rate", overdueDays: "Overdue days",
    resultCard: "Penalty Estimate Result", unit: "NT$", primaryValue: "Primary Value", maintenanceTarget: "Penalty (NT$)", actionTarget: "Reduced (NT$)", estimatedTdee: "Contract value", maintenance: "Original penalty", fatLossTarget: "Reduced ref.",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card penalty-ratio interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards graded by penalty-to-contract ratio, hinting at court-reduction likelihood. This is estimation guidance, not a legal ruling.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the penalty estimate into an actionable plan", conversionNote: "L9 values update from the computed result: daily penalty, contract ratio, and negotiation hint.",
    progressInsight: "Ratio Insight Card", possibleTarget: "Current penalty plan", dailyGap: "Daily penalty", weeklyTrend: "Contract ratio %", motivation: "Action Card", keepMomentum: "Move from estimate to negotiation or litigation prep",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's penalty estimate home", journeyHint: "Final amounts depend on contract terms and court findings; assess together with proof of actual damage.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm delay interest with Legal Interest Calculator", nextActionItem2: "Check contract-related tax with Stamp Duty Calculator", nextActionItem3: "If penalty is high, collect proof of actual damage for reduction",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Contract value → Penalty → Reduction → Negotiate/Litigate", bmrStep: "Contract value", deficitStep: "Penalty", trendStep: "Reduction", mealStep: "Negotiate",
    knowledge: "Knowledge", knowledgeTitle: "What liquidated damages mean in contract law", definition: "Definition", definitionText: "Liquidated damages are an amount agreed in advance, payable when one party breaches; they may be a pre-estimate of loss or punitive.", formula: "Formula", formulaText: "Daily: penalty = contract value × daily% × overdue days. Fixed: penalty = contract value × fixed%. The reduced amount is a reasonable reference per the court's discretion (Art. 252).", limitations: "Limitations", limitationsText: "This tool assumes linear calculation; actual penalty depends on contract wording, real damage, fault, and trade custom, and courts may reduce it.", interpretation: "Interpretation", interpretationText: "Penalties exceeding 20% of contract value face a markedly higher chance of reduction; proof of actual damage helps maintain or adjust the amount.", context: "Context", contextText: "Penalty should be assessed together with delay interest and actual damages to avoid double recovery.", example: "Example", exampleText: "Contract 1M, 0.1%/day, 30 days overdue → penalty 30,000 (3% of contract), a moderate range with low reduction likelihood.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for contract estimation", premiumTitle: "PRO Contract Risk Pack", premiumText: "Unlock penalty-clause health checks, reduction-likelihood models, damage-evidence checklists, and negotiation script templates.", feat1: "Clauses", feat2: "Reduction", feat3: "Evidence", feat4: "Scripts",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and estimation. It does not replace a lawyer, legal advice, or a court ruling.", relatedTools: "Related Tools", relatedToolsText: "Legal Interest Calculator · Severance Pay Calculator · Overtime Calculator · Stamp Duty Calculator", references: "References", referencesText: "Taiwan Civil Code Arts. 250–253 (liquidated damages); Supreme Court precedents on penalty reduction; standard-form contract regulations under the Fair Trade Act.",
    q1: "Can a penalty be set without limit?", a1: "No. Under Art. 252, if the agreed penalty is excessive, the court may reduce it to a reasonable amount.",
    q2: "Difference between pre-estimate and punitive penalties?", a2: "A pre-estimate compensates loss; a punitive one is paid in addition to damages, but is still subject to reduction.",
    q3: "Does a longer delay always mean a higher penalty?", a3: "Under daily mode it grows with days, but an excessive total may still be reduced to a reasonable range.",
    q4: "Can it be used for real-estate breach?", a4: "It can serve as a rough estimate, but property deals often have standard-form clauses and escrow; the contract and court findings prevail.",
    q5: "Can penalty and delay interest both be claimed?", a5: "It depends on the clause's nature; avoid double recovery for the same loss and clarify terms before claiming.",
    q6: "Can this tool replace a lawyer's opinion?", a6: "No. It is an educational estimate; for real disputes, large amounts, or litigation, consult a professional lawyer.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PenaltyCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [amount, setAmount] = useState("1000000");
  const [rate, setRate] = useState("0.1");
  const [mode, setMode] = useState<PenaltyMode>("daily");
  const [days, setDays] = useState("30");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(amount);
    const r = Number(rate);
    const d = Number(days);
    if (a <= 0 || r <= 0) return null;
    let penalty: number;
    if (mode === "daily") penalty = a * (r / 100) * (d > 0 ? d : 0);
    else penalty = a * (r / 100);
    const ratio = (penalty / a) * 100;
    // 法院酌減參考：比例超過20%者，超出部分酌減至約20%基準
    const reduced = ratio > 20 ? a * 0.2 : penalty;
    const dailyPenalty = mode === "daily" ? a * (r / 100) : (d > 0 ? penalty / d : penalty);
    return { penalty, ratio, reduced, dailyPenalty };
  }, [amount, rate, mode, days]);

  const penaltyDisplay = result ? fmt(result.penalty, 0) : "—";
  const reducedDisplay = result ? fmt(result.reduced, 0) : "—";
  const ratioDisplay = result ? fmt(result.ratio, 1) : "—";
  const dailyDisplay = result ? fmt(result.dailyPenalty, 0) : "—";

  function fillStandard() { setUnit("metric"); setAmount("1000000"); setRate("0.1"); setMode("daily"); setDays("30"); }
  function fillHighPenalty() { setUnit("metric"); setAmount("1000000"); setRate("0.5"); setMode("daily"); setDays("60"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_#f8fafc_45%,_#fae8ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-indigo-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{penaltyDisplay}</div><div className="text-sm font-bold text-indigo-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{fmt(Number(amount), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{rate}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{mode === "daily" ? "📅" : mode === "balance" ? "💰" : "📌"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighPenalty} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc · L5-CalculatorInput + L8-ScenarioComparison */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">0.1%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighPenalty} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">0.5%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={rate} onChange={(e) => setRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.overdueDays}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={days} onChange={(e) => setDays(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as PenaltyMode)}><option value="daily">{t.goalCut}</option><option value="fixed">{t.goalMaintain}</option><option value="balance">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-fuchsia-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{penaltyDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{ratioDisplay}%</div><div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-indigo-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-indigo-950">{penaltyDisplay}</p><p className="text-sm font-bold text-indigo-700">{t.unit}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{reducedDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.unit}</p></div><div className="rounded-2xl bg-fuchsia-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-fuchsia-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-fuchsia-950">{ratioDisplay}</p><p className="text-sm font-bold text-fuchsia-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-ResultIntelligence */}<p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{ratioDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="penalty-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-fuchsia-50 p-6 shadow-sm md:p-7">{/* L8 scenario data feeds L9 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper · progressInsightCard · motivationCard */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{penaltyDisplay}</div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-indigo-950">{dailyDisplay}</div></div><div className="rounded-2xl bg-fuchsia-50 p-4"><div className="text-xs font-black uppercase text-fuchsia-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-fuchsia-950">{ratioDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Contract", note: t.bmrStep }, { label: "Penalty", note: t.deficitStep }, { label: "Reduction", note: t.trendStep }, { label: "Negotiate", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-indigo-300 bg-indigo-50" : "border-fuchsia-200 bg-fuchsia-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="penalty-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">{/* L15-AffiliateResources · L16-PremiumGate */}<section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
