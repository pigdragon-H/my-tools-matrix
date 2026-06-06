// @profile B
// Profile B · Calculator-AI · AiLaborCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< $2000", label: { zh: "極省", en: "Minimal" }, desc: { zh: "整月人力成本極低，適合單人或小型團隊，幾乎無預算壓力。", en: "Very low monthly labor cost—great for solo or tiny teams, almost no budget pressure." } },
  { key: "low", range: "$2000–8000", label: { zh: "輕量", en: "Light" }, desc: { zh: "輕量人力區間，成本可控，記得保留招募與培訓的緩衝。", en: "Light labor band; cost is manageable—keep buffer for hiring and training." } },
  { key: "healthy", range: "$8000–25000", label: { zh: "成長", en: "Growing" }, desc: { zh: "多數成長期團隊常見區間，宜開始監控每人產出與工時分配。", en: "Common growth-stage band; start monitoring per-person output and hour allocation." } },
  { key: "good", range: "$25000–60000", label: { zh: "規模化", en: "Scaling" }, desc: { zh: "已進入規模化成本，建議導入 AI 輔助、流程自動化與外包分流。", en: "Scaling cost; introduce AI augmentation, process automation, and outsourcing routing." } },
  { key: "strong", range: "$60000–150000", label: { zh: "高負擔", en: "Heavy" }, desc: { zh: "成本偏高，務必比較團隊規模、AI 輔助比例與重複工作壓縮策略。", en: "Heavy cost; compare team size, AI augmentation ratio, and repetitive-work compression." } },
  { key: "elite", range: "> $150000", label: { zh: "企業級", en: "Enterprise" }, desc: { zh: "企業級用量，建議重整組織分工、自建 AI 工作流並評估外部夥伴自託管。", en: "Enterprise usage; restructure org division, build AI workflows, and assess outsourcing partners." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "自動化節省計算機", en: "Automation Savings Calculator" }, href: "/tools/ai/automation-savings-calculator" },
  { label: { zh: "AI ROI 計算機", en: "AI ROI Calculator" }, href: "/tools/ai/ai-roi-calculator" },
  { label: { zh: "Prompt ROI 計算機", en: "Prompt ROI Calculator" }, href: "/tools/ai/prompt-roi-calculator" },
  { label: { zh: "AI 導入 ROI", en: "AI Implementation ROI" }, href: "/tools/ai/ai-implementation-roi" },
];

const ui = {
  zh: {
    badge: "AI · 人力成本 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI 人力成本計算機 · Labor Cost", subtitle: "用每人月工時、團隊人數與 AI 輔助等級算出整月人力成本與每人成本",
    intro: "AI Labor Calculator 依據每人每月工時、團隊人數與 AI 輔助等級（高人力、標準或全自動），計算整月人力總成本、每人成本與成本密度，協助你判斷預算是否合理、該擴編還是導入 AI 輔助、是否該把重複工作交給自動化流程，讓你在規劃團隊與 AI 投資前就把人力花費算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以你輸入的 AI 輔助等級時薪估算，未含福利稅負、招募成本與各地薪資差異；實際成本請以你公司薪資與會計明細為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立人力範例", examplePreview: "成本預覽", examplePerson: "每人月工時", fillExample: "一鍵填入標準輔助範例", previewActivePath: "填入全自動範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入每人月工時、團隊人數與 AI 輔助等級", examplesHelper: "先用範例理解工時與時薪如何決定總成本與每人成本，再改成自己的團隊數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準輔助模式", activeExample: "全自動示範", baselineExampleNote: "工時 160 · 人數 5 · 標準", activeExampleNote: "工時 160 · 人數 5 · 全自動", carbsLabel: "每人成本", carbsName: "美元", proteinLabel: "成本密度", flowDemo: "團隊人數", calculator: "計算機",
    weight: "每人月工時 (小時)", tdee: "團隊人數 (人)", goal: "AI 輔助等級", goalCut: "高人力 ($50/時)", goalMaintain: "標準 ($30/時)", goalBulk: "全自動 ($12/時)",
    resultCard: "人力成本結果", unit: "USD (整月總成本)", primaryValue: "主要數值", maintenanceTarget: "成本密度", actionTarget: "總成本", estimatedTdee: "團隊人數", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格整月總成本判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前整月總成本放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把人力結果轉成可執行的成本控制策略", conversionNote: "L9 會連動目前計算結果，顯示成本密度、總成本與團隊人數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前團隊概況", dailyGap: "總成本", weeklyTrend: "成本密度", motivation: "動力卡", keepMomentum: "從成本分析走向最省的人力與 AI 配置節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的人力結果帶回團隊", journeyHint: "用自動化節省計算機一起看，把 AI 輔助與重複工作壓縮一併納入預算規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用自動化節省計算機估算可自動化工時", nextActionItem2: "用 AI ROI 計算機找出最划算投資", nextActionItem3: "用 AI 導入 ROI 把人力省下納入總回報",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Hours → 成本密度 → 等級 → 人數", bmrStep: "Hours", deficitStep: "成本密度", trendStep: "等級", mealStep: "人數",
    knowledge: "知識", knowledgeTitle: "成本密度在人力規劃中的意義", definition: "定義", definitionText: "人力成本規劃是把每人月工時乘以人數得總工時，再依輔助等級時薪換算成本；成本密度衡量每人成本相對於整體預算的比重，是判斷是否擴編或導入 AI 輔助的核心指標。", formula: "公式", formulaText: "總工時 = 每人月工時 × 人數。總成本 = 總工時 × 時薪。每人成本 = 總成本 ÷ 人數。成本密度 = 每人成本 ÷ 基準 × 100%。", limitations: "限制", limitationsText: "本工具以單一輔助等級時薪估算；真實成本還受福利稅負、招募培訓、各地薪資差異、加班與外包加成影響，且不同職能時薪差異大。", interpretation: "解讀", interpretationText: "整月成本超過 $25000 宜開始優化；可透過 AI 輔助、流程自動化、外包重複工作或重整分工來降低人力花費。", context: "脈絡", contextText: "人力結果應與自動化節省、AI ROI 與導入 ROI 一起看，才能在產出、成本與品質之間取得平衡。", example: "範例", exampleText: "每人 160 小時、標準輔助（$30/時）、5 人 → 總工時 800 小時，總成本約 $24000，每人約 $4800。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "人力的下一步工具", premiumTitle: "PRO 人力成本分析包", premiumText: "解鎖各地薪資基準、福利稅負加成、AI 輔助情境模擬與多團隊成本比較矩陣。", feat1: "區域薪資", feat2: "福利附加", feat3: "增補情境", feat4: "團隊矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供成本規劃與教育用途，不取代你公司薪資制度、會計明細或合約報價。", relatedTools: "相關工具", relatedToolsText: "Automation Savings · AI ROI · Prompt ROI · Implementation ROI", references: "參考資料", referencesText: "各地薪資調查報告；福利稅負規範；招募培訓成本指南；外包與自動化效益研究。",
    q1: "人力總成本怎麼算的？", a1: "本工具以每人月工時乘人數得總工時，再依輔助等級時薪換算成本；實際還受福利稅負與招募成本影響。",
    q2: "成本密度多少才合理？", a2: "成本密度越低代表每人越省；若每人成本偏高，建議導入 AI 輔助、自動化重複工作或重整分工。",
    q3: "高人力還是全自動？", a3: "重複規則性工作可走全自動等級；高判斷與創意工作才用高人力，並用 AI ROI 評估性價比。",
    q4: "人力成本太高怎麼降？", a4: "導入 AI 輔助、自動化重複流程、外包非核心工作、優化工時分配，並把長流程拆成可自動化模組。",
    q5: "要不要把福利稅負算進去？", a5: "建議分開。本工具用單一時薪快速估算；若福利稅負較重，請用 PRO 加成情境模擬完整成本。",
    q6: "這個工具能取代薪資制度嗎？", a6: "不能。它只是快速估算與教育用途；實際成本應以你公司薪資制度與會計明細為準。",
  },
  en: {
    badge: "AI · Labor Cost · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI Labor Calculator", subtitle: "Compute monthly total labor cost and per-person cost from hours per person, team size, and AI augmentation level",
    intro: "This calculator uses monthly hours per person, team size, and AI augmentation level (high-labor, standard, or full-automation) to compute monthly total labor cost, per-person cost, and cost density, helping you judge whether the budget is reasonable, whether to expand the team or introduce AI augmentation, and whether to hand repetitive work to automated workflows, so you compute labor spend clearly before investing in team and AI.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from the AI-augmentation hourly rate you enter, excluding benefits and tax burden, hiring cost, and regional wage differences; for actual cost, follow your company payroll and accounting detail.",
    quickActionCard: "Quick Action Card", tryExample: "Create a labor example instantly", examplePreview: "Cost preview", examplePerson: "Hours/person/month", fillExample: "One-click standard augmentation example", previewActivePath: "Fill full-automation example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter hours per person, team size, and AI augmentation level", examplesHelper: "Start with an example to see how hours and hourly rate set the total and per-person cost, then replace with your own team data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard augmentation mode", activeExample: "Full-automation demo", baselineExampleNote: "hours 160 · people 5 · standard", activeExampleNote: "hours 160 · people 5 · full-auto", carbsLabel: "Per-person cost", carbsName: "USD", proteinLabel: "Cost density", flowDemo: "Team size", calculator: "Calculator",
    weight: "Hours per person/month", tdee: "Team size (people)", goal: "AI augmentation level", goalCut: "High-labor ($50/hr)", goalMaintain: "Standard ($30/hr)", goalBulk: "Full-auto ($12/hr)",
    resultCard: "Labor Cost Result", unit: "USD (monthly total cost)", primaryValue: "Primary Value", maintenanceTarget: "Cost density", actionTarget: "Total cost", estimatedTdee: "Team size", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card monthly total-cost interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current monthly total cost into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the labor result into an actionable cost-control strategy", conversionNote: "L9 values update from the computed result: cost density, total cost, and team-size hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current team snapshot", dailyGap: "Total cost", weeklyTrend: "Cost density", motivation: "Motivation Card", keepMomentum: "Move from cost analysis to the leanest labor-and-AI configuration rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's labor result to your team", journeyHint: "Review it with the Automation Savings Calculator to fold AI augmentation and repetitive-work compression into budget planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Estimate automatable hours with the Automation Savings Calculator", nextActionItem2: "Find the best-value investment with the AI ROI Calculator", nextActionItem3: "Fold labor savings into total return with AI Implementation ROI",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Hours → Cost Density → Level → People", bmrStep: "Hours", deficitStep: "Cost density", trendStep: "Level", mealStep: "People",
    knowledge: "Knowledge", knowledgeTitle: "What cost density means in labor planning", definition: "Definition", definitionText: "Labor cost planning multiplies hours per person by team size for total hours, then converts by augmentation-level hourly rate into cost; cost density measures per-person cost relative to total budget, the core indicator of whether to expand or introduce AI augmentation.", formula: "Formula", formulaText: "Total hours = hours per person × people. Total cost = total hours × hourly rate. Per-person cost = total cost ÷ people. Cost density = per-person cost ÷ baseline × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from a single augmentation-level hourly rate; real cost is also affected by benefits and tax burden, hiring and training, regional wage differences, overtime, and outsourcing surcharges, and rates vary widely between roles.", interpretation: "Interpretation", interpretationText: "Monthly cost over $25000 warrants optimization; reduce labor spend with AI augmentation, process automation, outsourcing repetitive work, or restructuring division of labor.", context: "Context", contextText: "Labor results should be evaluated with automation savings, AI ROI, and implementation ROI to balance output, cost, and quality.", example: "Example", exampleText: "Hours 160 per person, standard augmentation ($30/hr), 5 people → total hours 800, total cost about $24000, per person about $4800.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for labor", premiumTitle: "PRO Labor Cost Analytics Pack", premiumText: "Unlock regional wage baselines, benefits and tax-burden surcharges, AI-augmentation scenario simulation, and a multi-team cost comparison matrix.", feat1: "Regional Wage", feat2: "Benefits Surcharge", feat3: "Augment Scenario", feat4: "Team Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for cost planning and education. It does not replace your company payroll system, accounting detail, or contract quote.", relatedTools: "Related Tools", relatedToolsText: "Automation Savings · AI ROI · Prompt ROI · Implementation ROI", references: "References", referencesText: "Regional wage survey reports; benefits and tax-burden norms; hiring and training cost guides; outsourcing and automation benefit studies.",
    q1: "How is total labor cost calculated?", a1: "This tool multiplies hours per person by team size for total hours, then converts by hourly rate; actual is also affected by benefits, tax burden, and hiring cost.",
    q2: "What cost density is reasonable?", a2: "The lower the cost density the leaner per person; if per-person cost is high, introduce AI augmentation, automate repetitive work, or restructure division of labor.",
    q3: "High-labor or full-automation?", a3: "Use full-automation for repetitive rule-based work; use high-labor only for high-judgment and creative work, and assess value with the AI ROI Calculator.",
    q4: "How do I reduce labor cost?", a4: "Introduce AI augmentation, automate repetitive processes, outsource non-core work, optimize hour allocation, and split long processes into automatable modules.",
    q5: "Should I include benefits and tax burden?", a5: "Recommended to separate. This tool uses a single hourly rate for a quick estimate; if benefits and tax burden are heavy, use the PRO surcharge scenario simulation.",
    q6: "Can this tool replace the payroll system?", a6: "No. It is a quick estimate for education; actual cost should follow your company payroll system and accounting detail.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function hourlyRate(mode: TierMode): number {
  if (mode === "relaxed") return 50;
  if (mode === "fast") return 12;
  return 30;
}

export default function AiLaborCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("160");
  const [tdee, setTdee] = useState("5");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const hours = Number(weight);
    const people = Number(tdee);
    if (hours <= 0 || people <= 0) return null;
    const totalHours = hours * people;
    const totalCost = totalHours * hourlyRate(goal);
    const costPerPerson = totalCost / people;
    const costDensity = Math.min((costPerPerson / 8000) * 100, 100);
    return { totalHours, totalCost, costPerPerson, costDensity };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.costDensity, 1) : "—";
  const fatDisplay = result ? fmt(result.totalCost, 0) : "—";
  const carbDisplay = result ? fmt(result.costPerPerson, 0) : "—";
  const totalDisplay = result ? fmt(result.totalCost, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("160"); setTdee("5"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("160"); setTdee("5"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">24000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">9600</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ai-labor-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.totalCost, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.costDensity, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Hours", note: t.bmrStep }, { label: "CostDensity", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "People", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ai-labor-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
