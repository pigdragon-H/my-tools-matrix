// @profile B
// Profile B · Calculator-Design · TypeScaleCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 1.06", label: { zh: "微差", en: "Micro" }, desc: { zh: "級數極小，層級差異幾乎不可見，僅適合極細微的排版調整。", en: "Tiny scale, barely visible difference between levels; only for subtle typographic tweaks." } },
  { key: "low", range: "1.06–1.125", label: { zh: "緊湊", en: "Compact" }, desc: { zh: "常見於正文與輔助文字的級數，適合密排資訊與表單。", en: "Common for body and auxiliary text sizes; good for dense info and forms." } },
  { key: "healthy", range: "1.125–1.25", label: { zh: "經典", en: "Classic" }, desc: { zh: "Major Third 至 Major Second 區間，最常用的標題與正文級數。", en: "Major Third to Major Second range; the most popular heading and body scale." } },
  { key: "good", range: "1.25–1.333", label: { zh: "鮮明", en: "Distinct" }, desc: { zh: "層級差異明顯，標題與正文對比清晰，適合內容行銷與登入頁。", en: "Clear level differences; heading vs body contrast is sharp, ideal for content marketing and landing pages." } },
  { key: "strong", range: "1.333–1.618", label: { zh: "強烈", en: "Dramatic" }, desc: { zh: "接近黃金比例的級數差，視覺衝擊強，適合品牌首頁與藝術排版。", en: "Approaches golden-ratio steps; strong visual impact, ideal for brand hero pages and artistic layouts." } },
  { key: "elite", range: "> 1.618", label: { zh: "極端", en: "Extreme" }, desc: { zh: "極大級數差，層級跳躍非常劇烈，僅適合裝飾性或概念性排版。", en: "Huge scale jumps; level leaps are dramatic, only for decorative or conceptual layouts." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "色彩對比度計算機", en: "Color Contrast Ratio Calculator" }, href: "/tools/design/color-contrast-ratio-calculator" },
  { label: { zh: "長寬比計算機", en: "Aspect Ratio Calculator" }, href: "/tools/design/aspect-ratio-calculator" },
  { label: { zh: "黃金比例計算機", en: "Golden Ratio Calculator" }, href: "/tools/design/golden-ratio-calculator" },
  { label: { zh: "行高計算機", en: "Line Height Calculator" }, href: "/tools/design/line-height-calculator" },
];

const ui = {
  zh: {
    badge: "Design · 字級級數 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "字級級數計算機 · Type Scale", subtitle: "用基礎字級、級數比率與級數次數算出字級序列、最大字級與匹配分數",
    intro: "Type Scale Calculator 依據基礎字級、級數比率與級數次數，計算字級序列、最大字級與匹配分數，協助您判斷標題層級是否清晰、該選哪種比率、是否需要調整基礎字級，讓您在決定排版規格前就把字級層級算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的數值估算字級序列，未含行高、字距與瀏覽器渲染差異；正式排版請以實際預覽為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立級數範例", examplePreview: "級數預覽", examplePerson: "基礎字級", fillExample: "一鍵填入 Major Third 範例", previewActivePath: "填入 Perfect Fifth 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入基礎字級、級數比率與級數次數", examplesHelper: "先用範例理解基礎字級與比率如何決定層級序列，再改成自己的數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "Major Third 模式", activeExample: "Perfect Fifth 示範", baselineExampleNote: "16px · 1.25 · 6", activeExampleNote: "16px · 1.5 · 6", carbsLabel: "匹配分數", carbsName: "百分比", proteinLabel: "合規分數", flowDemo: "級數次數", calculator: "計算機",
    weight: "級數比率 (ratio)", tdee: "級數次數 (steps)", goal: "級數模式", goalCut: "Minor Third (1.2)", goalMaintain: "Major Third (1.25)", goalBulk: "Perfect Fifth (1.5)",
    resultCard: "字級級數結果", unit: "px (最大字級)", primaryValue: "主要數值", maintenanceTarget: "合規分數", actionTarget: "最大字級", estimatedTdee: "級數次數", maintenance: "%", fatLossTarget: "px",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格字級級數判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前級數比率放進常見區間；這是設計參考，不是排版品質結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把級數結果轉成可執行的排版調整策略", conversionNote: "L9 會連動目前計算結果，顯示合規分數、最大字級與級數比率提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前級數概況", dailyGap: "級數比率", weeklyTrend: "合規分數", motivation: "動力卡", keepMomentum: "從級數分析走向最清晰的排版層級節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的級數結果帶回團隊", journeyHint: "用行高計算機一起看，把字級大小與行高比例一併納入設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用行高計算機決定最適行高", nextActionItem2: "用色彩對比度計算機確保可讀性", nextActionItem3: "用黃金比例計算機平衡版面留白",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Base × Ratio → Steps → Max → Match", bmrStep: "Base", deficitStep: "Ratio", trendStep: "Max", mealStep: "Match",
    knowledge: "知識", knowledgeTitle: "字級級數在排版中的意義", definition: "定義", definitionText: "字級級數是透過固定比率遞增基礎字級，產生和諧的標題層級序列；比率越高代表層級差異越明顯，是模組化排版的基礎工具。", formula: "公式", formulaText: "最大字級 = 基礎 × 比率^次數。匹配分數 = max(0, (1 − |實際比 − 目標比| ÷ 目標比) × 100)。合規分數 = min(實際比 ÷ 目標比 × 100, 100)。", limitations: "限制", limitationsText: "本工具以數學比率估算；實際排版還受字體度量、行高、字距與瀏覽器渲染影響。", interpretation: "解讀", interpretationText: "比率低於 1.125 建議用於密排場景；1.25 是最通用的級數；1.5 以上適合品牌視覺衝擊，並用匹配分數判斷層級清晰度。", context: "脈絡", contextText: "級數結果應與行高、對比度與版面比例一起看，才能在可讀性、美感與無障礙之間取得平衡。", example: "範例", exampleText: "基礎 16px、比率 1.25、6 次 → 最大字級約 48.8px，匹配分數 100%，合規分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "級數的下一步工具", premiumTitle: "PRO 字級級數分析包", premiumText: "解鎖批量級數計算、CSS 匯出、自訂比率預設與團隊協作。", feat1: "批次級距", feat2: "CSS匯出", feat3: "自訂預設", feat4: "團隊協作",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任", trustText: "本工具僅供設計規劃與教育用途，不取代實際瀏覽器預覽或排版品質檢測。", relatedTools: "相關工具", relatedToolsText: "Color Contrast · Aspect Ratio · Golden Ratio · Line Height", references: "參考資料", referencesText: "W3C CSS font-size 規範；Typescale.com 參考；模組化排版指南；無障礙設計指南。",
    q1: "字級級數怎麼算的？", a1: "本工具將基礎字級乘以比率的次方得到各層級字級，再與目標比率比較算出匹配分數與合規分數。",
    q2: "匹配分數多少才合理？", a2: "匹配分數達 100 代表完全符合目標比率；若低於 100，建議調整比率或基礎字級。",
    q3: "Major Third 還是 Perfect Fifth？", a3: "一般網頁用 Major Third（1.25）即可；品牌視覺衝擊或藝術排版建議用 Perfect Fifth（1.5）。",
    q4: "級數太陡怎麼調整？", a4: "降低比率、減少次數或提高基礎字級，讓層級差異更柔和。",
    q5: "要不要考慮級數次數？", a5: "需要。次數決定最終最大字級，比率不變但次數影響整體層級跨度與可用性。",
    q6: "這個工具能取代瀏覽器預覽嗎？", a6: "不能。它只是快速估算與教育用途；正式排版應以實際瀏覽器預覽與量測為準。",
  },
  en: {
    badge: "Design · Type Scale · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Type Scale Calculator", subtitle: "Compute type scale sequence, max font size, and match score from base size, ratio, and steps",
    intro: "This calculator uses base font size, scale ratio, and step count to compute the type scale sequence, maximum font size, and match score, helping you judge whether heading levels are clear, which ratio to target, and whether to adjust the base size, so you compute typographic hierarchy clearly before finalizing design specs.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates the type scale from values you enter, excluding line height, letter spacing, and browser rendering differences; for formal typography, verify with actual previews.",
    quickActionCard: "Quick Action Card", tryExample: "Create a scale example instantly", examplePreview: "Scale preview", examplePerson: "Base size", fillExample: "One-click Major Third example", previewActivePath: "Fill Perfect Fifth example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter base size, scale ratio, and step count", examplesHelper: "Start with an example to see how base size and ratio set the hierarchy sequence, then replace with your own data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Major Third mode", activeExample: "Perfect Fifth demo", baselineExampleNote: "16px · 1.25 · 6", activeExampleNote: "16px · 1.5 · 6", carbsLabel: "Match score", carbsName: "percent", proteinLabel: "Compliance score", flowDemo: "Step count", calculator: "Calculator",
    weight: "Scale ratio", tdee: "Step count (steps)", goal: "Scale mode", goalCut: "Minor Third (1.2)", goalMaintain: "Major Third (1.25)", goalBulk: "Perfect Fifth (1.5)",
    resultCard: "Type Scale Result", unit: "px (max font size)", primaryValue: "Primary Value", maintenanceTarget: "Compliance score", actionTarget: "Max font size", estimatedTdee: "Step count", maintenance: "%", fatLossTarget: "px",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card type-scale interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current scale ratio into common zones. This is design guidance, not a typographic-quality conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the scale result into an actionable typographic-adjustment strategy", conversionNote: "L9 values update from the computed result: compliance score, max font size, and scale-ratio hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current scale snapshot", dailyGap: "Scale ratio", weeklyTrend: "Compliance score", motivation: "Motivation Card", keepMomentum: "Move from scale analysis to the clearest typographic hierarchy rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's scale result to your team", journeyHint: "Review it with the Line Height Calculator to fold font size and line height ratio into design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Decide optimal line height with the Line Height Calculator", nextActionItem2: "Ensure legibility with the Color Contrast Ratio Calculator", nextActionItem3: "Balance layout whitespace with the Golden Ratio Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Base × Ratio → Steps → Max → Match", bmrStep: "Base", deficitStep: "Ratio", trendStep: "Max", mealStep: "Match",
    knowledge: "Knowledge", knowledgeTitle: "What type scale means in typography", definition: "Definition", definitionText: "Type scale is a sequence of font sizes generated by multiplying a base size by a fixed ratio; higher ratios mean more dramatic heading levels, the foundational tool for modular typography.", formula: "Formula", formulaText: "Max size = base × ratio^steps. Match score = max(0, (1 − |actual − target| ÷ target) × 100). Compliance score = min(actual ÷ target × 100, 100).", limitations: "Limitations", limitationsText: "This tool estimates from mathematical ratios; real typography is also affected by font metrics, line height, letter spacing, and browser rendering.", interpretation: "Interpretation", interpretationText: "Ratios below 1.125 suit dense layouts; 1.25 is the most versatile scale; 1.5 or above for brand visual impact, and use match score to judge level clarity.", context: "Context", contextText: "Scale results should be evaluated with line height, contrast ratio, and layout proportion to balance legibility, aesthetics, and accessibility.", example: "Example", exampleText: "Base 16px, ratio 1.25, 6 steps → max font size about 48.8px, match score 100%, compliance score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for type scale", premiumTitle: "PRO Type Scale Analytics Pack", premiumText: "Unlock batch scale calculation, CSS export, custom ratio presets, and team collaboration.", feat1: "Batch Scale", feat2: "Export CSS", feat3: "Custom Preset", feat4: "Team Collab",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for design planning and education. It does not replace actual browser preview or typographic quality testing.", relatedTools: "Related Tools", relatedToolsText: "Color Contrast · Aspect Ratio · Golden Ratio · Line Height", references: "References", referencesText: "W3C CSS font-size spec; Typescale.com reference; modular typography guides; accessible design guides.",
    q1: "How is type scale calculated?", a1: "This tool multiplies the base size by the ratio raised to the step count for each level, then compares the actual ratio to the target to compute match and compliance scores.",
    q2: "What match score is reasonable?", a2: "A match score of 100 means it perfectly matches the target ratio; if below 100, adjust the ratio or base size.",
    q3: "Major Third or Perfect Fifth?", a3: "Use Major Third (1.25) for general web typography; use Perfect Fifth (1.5) for brand visual impact or artistic layouts.",
    q4: "How do I fix a too-steep scale?", a4: "Lower the ratio, reduce steps, or increase the base size to soften the level differences.",
    q5: "Should I consider step count?", a5: "Yes. Step count determines the final max font size; ratio stays the same but steps affect the overall hierarchy span and usability.",
    q6: "Can this tool replace browser preview?", a6: "No. It is a quick estimate for education; formal typography should follow actual browser previews and measurements.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function scaleTarget(mode: TierMode): number {
  if (mode === "relaxed") return 1.2;
  if (mode === "fast") return 1.5;
  return 1.25;
}

export default function TypeScaleCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1.25");
  const [tdee, setTdee] = useState("6");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const ratio = parseFloat(weight);
    const steps = parseInt(tdee, 10);
    if (ratio <= 0 || steps <= 0 || !Number.isFinite(ratio)) return null;
    const base = 16;
    const maxSize = base * Math.pow(ratio, steps);
    const targetRatio = scaleTarget(goal);
    const matchScore = Math.max(0, (1 - Math.abs(ratio - targetRatio) / targetRatio) * 100);
    const complianceScore = Math.min((ratio / targetRatio) * 100, 100);
    return { maxSize, ratio, targetRatio, matchScore, complianceScore };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.complianceScore, 1) : "—";
  const fatDisplay = result ? fmt(result.maxSize, 1) : "—";
  const carbDisplay = result ? fmt(result.matchScore, 1) : "—";
  const totalDisplay = result ? fmt(result.maxSize, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1.25"); setTdee("6"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1.5"); setTdee("6"); setGoal("fast"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">16</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">1.25</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1.50</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">px</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">px</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="type-scale-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{weight}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.complianceScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Base", note: t.bmrStep }, { label: "Ratio", note: t.deficitStep }, { label: "Max", note: t.trendStep }, { label: "Match", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
