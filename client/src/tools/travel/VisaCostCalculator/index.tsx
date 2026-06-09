// @profile B
// Profile B · Calculator-Travel · VisaCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "relaxed" | "standard" | "fast";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 50", label: { zh: "輕負擔", en: "Light" }, desc: { zh: "整團簽證費用很低，對旅遊預算幾乎沒有壓力，可放心規劃。", en: "Very low total visa cost—almost no pressure on the travel budget." } },
  { key: "low", range: "50–150", label: { zh: "可控", en: "Manageable" }, desc: { zh: "費用可控，記得保留代辦與快件費的緩衝空間。", en: "Manageable cost; keep buffer for agency and express fees." } },
  { key: "healthy", range: "150–300", label: { zh: "中等", en: "Moderate" }, desc: { zh: "多數家庭旅遊常見區間，宜比較直辦與代辦的總價。", en: "Common family-trip band; compare direct vs agency total prices." } },
  { key: "good", range: "300–500", label: { zh: "偏高", en: "High" }, desc: { zh: "費用偏高，建議評估是否需要快件或可改用電子簽降低成本。", en: "High cost; assess whether express is needed or e-visa can lower it." } },
  { key: "strong", range: "500–800", label: { zh: "昂貴", en: "Expensive" }, desc: { zh: "整團費用昂貴，務必把簽證納入總預算並提早辦理避免加急。", en: "Expensive total; fold visa into the budget and apply early to avoid rush fees." } },
  { key: "elite", range: "> 800", label: { zh: "極高", en: "Very high" }, desc: { zh: "費用極高，建議拆分申辦時程、比較多代辦報價並確認必要性。", en: "Very high; stagger the timeline, compare multiple agency quotes, and confirm necessity." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "行李重量計算機", en: "Luggage Weight Calculator" }, href: "/tools/travel/luggage-weight-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "貨幣旅遊換算", en: "Currency Travel Converter" }, href: "/tools/travel/currency-travel-converter" },
];

const ui = {
  zh: {
    badge: "旅遊 · 簽證費用 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "簽證費用計算機 · Visa Cost", subtitle: "用簽證類型、申請人數與代辦費算出整團簽證總費用與代辦占比",
    intro: "Visa Cost Calculator 依據簽證類型（觀光、商務或快件）、申請人數與每人代辦費，計算整團簽證基本費、代辦費與簽證總費用，協助您判斷費用是否合理、代辦占比多高、是否該改用電子簽或提早辦理避免加急，讓出國前的簽證成本一次算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的簽證類型與代辦費估算，未含各國最新規費、匯率與特殊文件費；實際費用請以各國使館或官方簽證系統公告為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立簽證範例", examplePreview: "簽證預覽", examplePerson: "申請人數", fillExample: "一鍵填入觀光簽範例", previewActivePath: "填入快件簽範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入申請人數、每人代辦費與簽證類型", examplesHelper: "先用範例理解人數與費用如何決定總費用與代辦占比，再改成自己的申辦數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "觀光簽模式", activeExample: "快件簽示範", baselineExampleNote: "人數 2 · 代辦 30 · 觀光", activeExampleNote: "人數 2 · 代辦 30 · 快件", carbsLabel: "代辦費用", carbsName: "占比", proteinLabel: "代辦占比", flowDemo: "每人代辦費", calculator: "計算機",
    weight: "申請人數 (人)", tdee: "每人代辦費 (USD)", goal: "簽證類型", goalCut: "觀光簽 ($60)", goalMaintain: "商務簽 ($120)", goalBulk: "快件簽 ($200)",
    resultCard: "簽證計算結果", unit: "USD (簽證總費用)", primaryValue: "主要數值", maintenanceTarget: "代辦占比", actionTarget: "簽證總費用", estimatedTdee: "申請人數", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格簽證總費用判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前簽證總費用放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把簽證結果轉成可執行的申辦策略", conversionNote: "L9 會連動目前計算結果，顯示代辦占比、總費用與人數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前簽證概況", dailyGap: "簽證總費用", weeklyTrend: "代辦占比", motivation: "動力卡", keepMomentum: "從費用分析走向最省的簽證申辦節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的簽證結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，把簽證費與代辦費一併納入行程總預算。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算計算機把簽證費納入總花費", nextActionItem2: "用貨幣旅遊換算把費用換成當地幣別", nextActionItem3: "用旅遊天數確認簽證效期與停留天數相符",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "人數 → 代辦占比 → 類型 → 費用", bmrStep: "人數", deficitStep: "代辦占比", trendStep: "類型", mealStep: "費用",
    knowledge: "知識", knowledgeTitle: "代辦占比在簽證費用中的意義", definition: "定義", definitionText: "簽證費用規劃是把每人基本規費與代辦費乘以人數得到總費用；代辦占比衡量手續費相對於整體成本的比重，是判斷直辦或代辦的核心指標。", formula: "公式", formulaText: "基本費總額 = 每人簽證費 × 人數。代辦費總額 = 每人代辦費 × 人數。簽證總費用 = 基本費總額 + 代辦費總額。代辦占比 = 代辦費總額 ÷ 總費用 × 100%。", limitations: "限制", limitationsText: "本工具以您輸入的類型與代辦費估算；真實費用還受各國最新規費、匯率波動、特殊文件費、保險與面試成本影響，且部分國家採電子簽或落地簽。", interpretation: "解讀", interpretationText: "代辦占比過高代表手續費吃掉太多預算；可透過自行線上申辦、改用電子簽、提早辦理避免加急或比較多家代辦報價來改善。", context: "脈絡", contextText: "簽證結果應與旅遊預算、貨幣換算與旅遊天數一起看，才能在費用、效期與行程之間取得平衡。", example: "範例", exampleText: "人數 2、觀光簽（$60）、每人代辦 30 → 基本費 120、代辦費 60，總費用 180 USD，代辦占比約 33%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "簽證的下一步工具", premiumTitle: "PRO 簽證費用分析包", premiumText: "解鎖各國即時規費查詢、多人申辦分攤最佳化、代辦比價與效期到期提醒。", feat1: "即時費用查詢", feat2: "費用分攤", feat3: "代辦比較", feat4: "到期警示",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代各國使館、官方簽證系統或合法代辦的正式報價與規定。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Luggage Weight · Travel Day · Currency Travel", references: "參考資料", referencesText: "各國使館簽證規費公告；官方電子簽系統；外交部旅外資訊；簽證代辦費率統計。",
    q1: "簽證總費用怎麼算的？", a1: "本工具以每人基本規費與代辦費分別乘以人數再相加；實際還受各國最新規費與匯率影響。",
    q2: "代辦占比多少才合理？", a2: "代辦占比越低越省；若手續費吃掉大半預算，建議考慮自行線上申辦或改用電子簽。",
    q3: "觀光簽還是商務簽？", a3: "出遊選觀光簽；洽公或參展選商務簽；趕時間可選快件簽但費用較高，依行程目的與時效決定。",
    q4: "費用太高怎麼降？", a4: "自行線上申辦、改用電子簽或落地簽、提早辦理避免加急、多家代辦比價，並把多人申辦的固定費用分攤。",
    q5: "要不要把代辦費算進去？", a5: "要。本工具的代辦占比已把每人代辦費納入；若自行申辦，可把代辦費設為 0 看純規費。",
    q6: "這個工具能取代使館規定嗎？", a6: "不能。它只是快速估算與教育用途；實際費用與文件要求應以各國使館或官方簽證系統公告為準。",
  },
  en: {
    badge: "Travel · Visa Cost · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Visa Cost Calculator", subtitle: "Compute total group visa cost and agency-fee share from visa type, applicant count, and agency fee",
    intro: "This calculator uses visa type (tourist, business, or express), applicant count, and per-applicant agency fee to compute total group base fee, agency fee, and total visa cost, helping you judge whether the cost is reasonable, how high the agency share is, and whether to switch to an e-visa or apply early to avoid rush fees, so the pre-trip visa cost is computed once and clearly.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from the visa type and agency fee you enter, excluding each country's latest fees, exchange rates, and special-document costs; for actual fees, follow each consulate or official visa system's announcements.",
    quickActionCard: "Quick Action Card", tryExample: "Create a visa example instantly", examplePreview: "Visa preview", examplePerson: "Applicants", fillExample: "One-click tourist visa example", previewActivePath: "Fill express visa example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter applicant count, per-applicant agency fee, and visa type", examplesHelper: "Start with an example to see how count and fees set the total cost and agency share, then replace with your own application data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Tourist visa mode", activeExample: "Express visa demo", baselineExampleNote: "Applicants 2 · agency 30 · tourist", activeExampleNote: "Applicants 2 · agency 30 · express", carbsLabel: "Agency cost", carbsName: "share", proteinLabel: "Agency share", flowDemo: "Per-applicant agency fee", calculator: "Calculator",
    weight: "Applicants (people)", tdee: "Per-applicant agency fee (USD)", goal: "Visa type", goalCut: "Tourist ($60)", goalMaintain: "Business ($120)", goalBulk: "Express ($200)",
    resultCard: "Visa Result", unit: "USD (total visa cost)", primaryValue: "Primary Value", maintenanceTarget: "Agency share", actionTarget: "Total visa cost", estimatedTdee: "Applicants", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card total visa-cost interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current total visa cost into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the visa result into an actionable application strategy", conversionNote: "L9 values update from the computed result: agency share, total cost, and applicant-count hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current visa snapshot", dailyGap: "Total visa cost", weeklyTrend: "Agency share", motivation: "Motivation Card", keepMomentum: "Move from cost analysis to the cheapest visa-application rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's visa result to your group", journeyHint: "Review it with the Travel Budget Calculator to fold visa and agency fees into the total itinerary budget.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold visa fees into total spend with Travel Budget", nextActionItem2: "Convert the cost into local currency with Currency Travel", nextActionItem3: "Confirm visa validity matches stay length with Travel Day",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Applicants → Agency Share → Type → Cost", bmrStep: "Applicants", deficitStep: "Agency share", trendStep: "Type", mealStep: "Cost",
    knowledge: "Knowledge", knowledgeTitle: "What agency share means in visa cost", definition: "Definition", definitionText: "Visa cost planning multiplies per-applicant base fee and agency fee by applicants for a total cost; agency share measures handling fees relative to total cost, the core indicator of direct vs agency application.", formula: "Formula", formulaText: "Base total = per-applicant visa fee × applicants. Agency total = per-applicant agency fee × applicants. Total visa cost = base total + agency total. Agency share = agency total ÷ total cost × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from the type and agency fee you enter; real cost is also affected by each country's latest fees, exchange-rate swings, special-document costs, insurance, and interview costs, and some countries use e-visa or visa-on-arrival.", interpretation: "Interpretation", interpretationText: "A high agency share means handling fees eat too much budget; improve it by self-applying online, switching to an e-visa, applying early to avoid rush fees, or comparing multiple agency quotes.", context: "Context", contextText: "Visa results should be evaluated with travel budget, currency conversion, and travel day to balance cost, validity, and itinerary.", example: "Example", exampleText: "Applicants 2, tourist visa ($60), agency 30 each → base 120, agency 60, total 180 USD, agency share about 33%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for visas", premiumTitle: "PRO Visa Cost Analytics Pack", premiumText: "Unlock per-country live fee lookup, multi-applicant cost-sharing optimization, agency price comparison, and validity-expiry alerts.", feat1: "Live Fee Lookup", feat2: "Cost Sharing", feat3: "Agency Compare", feat4: "Expiry Alert",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace each consulate, the official visa system, or a licensed agency's formal quote and rules.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Luggage Weight · Travel Day · Currency Travel", references: "References", referencesText: "Per-consulate visa-fee announcements; official e-visa systems; foreign-ministry travel advisories; visa agency fee-rate statistics.",
    q1: "How is total visa cost calculated?", a1: "This tool multiplies per-applicant base fee and agency fee by applicants and adds them; actual is also affected by each country's latest fees and exchange rate.",
    q2: "What agency share is reasonable?", a2: "The lower the agency share the cheaper; if handling fees eat most of the budget, consider self-applying online or switching to an e-visa.",
    q3: "Tourist or business visa?", a3: "Pick tourist for travel; business for meetings or exhibitions; express if pressed for time but it costs more—decide by trip purpose and timing.",
    q4: "How do I reduce the cost?", a4: "Self-apply online, switch to an e-visa or visa-on-arrival, apply early to avoid rush fees, compare multiple agency quotes, and share fixed fees across applicants.",
    q5: "Should I count the agency fee?", a5: "Yes. This tool's agency share already includes per-applicant agency fees; if self-applying, set the agency fee to 0 to see pure fees.",
    q6: "Can this tool replace consulate rules?", a6: "No. It is a quick estimate for education; the actual cost and document requirements should follow each consulate or official visa system's announcements.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function baseFee(mode: TierMode): number {
  if (mode === "relaxed") return 60;
  if (mode === "fast") return 200;
  return 120;
}

export default function VisaCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("2");
  const [tdee, setTdee] = useState("30");
  const [goal, setGoal] = useState<TierMode>("relaxed");
  const t = ui[lang];

  const result = useMemo(() => {
    const applicants = Number(weight);
    const serviceFee = Number(tdee);
    if (applicants <= 0 || serviceFee < 0) return null;
    const baseTotal = baseFee(goal) * applicants;
    const serviceTotal = serviceFee * applicants;
    const grandTotal = baseTotal + serviceTotal;
    const serviceShare = grandTotal > 0 ? Math.min((serviceTotal / grandTotal) * 100, 100) : 0;
    return { baseTotal, serviceTotal, grandTotal, serviceShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.serviceShare, 1) : "—";
  const fatDisplay = result ? fmt(result.grandTotal, 0) : "—";
  const carbDisplay = result ? fmt(result.serviceShare, 1) : "—";
  const totalDisplay = result ? fmt(result.grandTotal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("2"); setTdee("30"); setGoal("relaxed"); }
  function fillCut() { setUnit("metric"); setWeight("2"); setTdee("30"); setGoal("fast"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">180</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">460</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fatDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="visa-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.grandTotal, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.serviceShare, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Applicants", note: t.bmrStep }, { label: "AgencyShare", note: t.deficitStep }, { label: "Type", note: t.trendStep }, { label: "Cost", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="visa-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
