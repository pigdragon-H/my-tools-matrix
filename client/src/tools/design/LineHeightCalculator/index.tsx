// @profile B
// Profile B · Calculator-Design · LineHeightCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tight", range: "< 1.2", label: { zh: "緊湊", en: "Tight" }, desc: { zh: "行高極低，行距幾乎無間隙，僅適用標題或裝飾性短文字，正文閱讀會非常吃力。", en: "Very low line-height, almost no gap between lines; only for headings or decorative short text, body reading is very strained." } },
  { key: "compact", range: "1.2–1.4", label: { zh: "偏緊", en: "Compact" }, desc: { zh: "行高偏緊，適合標題與導航元素，但正文長段落會因行距不足而降低可讀性。", en: "Compact line-height, good for headings and nav elements, but long body paragraphs suffer from insufficient line spacing." } },
  { key: "optimal", range: "1.4–1.6", label: { zh: "最佳區間", en: "Optimal" }, desc: { zh: "行高落在最佳可讀性區間，正文與長文閱讀均舒適，是大多數情境的推薦設定。", en: "Line-height in the optimal readability zone; comfortable for body and long-form reading, recommended for most contexts." } },
  { key: "relaxed", range: "1.6–1.8", label: { zh: "寬鬆", en: "Relaxed" }, desc: { zh: "行高偏寬鬆，適合寬欄正文或需要更多呼吸感的版面，但過寬會使段落顯得鬆散。", en: "Relaxed line-height, suitable for wide-column body text or layouts needing more breathing room, but may feel loose." } },
  { key: "loose", range: "1.8–2.0", label: { zh: "疏朗", en: "Loose" }, desc: { zh: "行高非常寬鬆，適合詩歌、引用或特殊排版風格，一般正文不建議使用。", en: "Very loose line-height, good for poetry, blockquotes, or special typographic styles; not recommended for general body text." } },
  { key: "extreme", range: "> 2.0", label: { zh: "極寬", en: "Extreme" }, desc: { zh: "行高極大，行間距過寬，閱讀時眼球需要大幅移動，通常僅用於特殊藝術排版。", en: "Extremely large line-height, lines are so far apart that eye tracking becomes difficult; usually only for artistic layouts." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字級數值計算機", en: "Type Scale Calculator" }, href: "/tools/design/type-scale-calculator" },
  { label: { zh: "色彩對比計算機", en: "Color Contrast Ratio Calculator" }, href: "/tools/design/color-contrast-ratio-calculator" },
  { label: { zh: "黃金比例計算機", en: "Golden Ratio Calculator" }, href: "/tools/design/golden-ratio-calculator" },
  { label: { zh: "Px-Rem 轉換器", en: "Px-Rem Converter" }, href: "/tools/design/px-rem-converter" },
];

const ui = {
  zh: {
    badge: "Design · 行高 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "行高計算器 · Line Height", subtitle: "用字級大小、行高倍率與閱讀情境算出實際行距、舒適分數與最佳倍率建議",
    intro: "Line Height Calculator 依據字級大小、行高倍率與閱讀情境（緊湊標題、標準正文或寬鬆長文），計算實際行距、舒適分數與最佳倍率建議，協助您判斷文字行距是否舒適易讀、該選哪個行高倍率、是否需要加寬或壓縮行距，讓您在決定排版參數前就把可讀性與美感算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的字級與倍率估算行距與舒適分數，未含字體度量與環境渲染差異；正式排版請以實際字體度量與預覽為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立行高範例", examplePreview: "行高預覽", examplePerson: "字級大小", fillExample: "一鍵填入標準正文範例", previewActivePath: "填入寬鬆長文範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入字級大小、行高倍率與閱讀情境", examplesHelper: "先用範例理解倍率如何決定行距與舒適分數，再改成自己的排版數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準正文模式", activeExample: "寬鬆長文示範", baselineExampleNote: "16px · 1.5 · 標準", activeExampleNote: "18px · 1.75 · 寬鬆", carbsLabel: "舒適餘量", carbsName: "百分比", proteinLabel: "舒適分數", flowDemo: "行高倍率", calculator: "計算器",
    weight: "字級大小 (px)", tdee: "行高倍率", goal: "閱讀情境", goalCut: "緊湊標題 (1.2)", goalMaintain: "標準正文 (1.5)", goalBulk: "寬鬆長文 (1.75)",
    resultCard: "行高結果", unit: "px (行距)", primaryValue: "主要數值", maintenanceTarget: "舒適分數", actionTarget: "實際行距", estimatedTdee: "行高倍率", maintenance: "分", fatLossTarget: "px",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格行高判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前行高放進常見區間；這是排版參考，不是字體度量結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把行高結果轉成可執行的排版調整策略", conversionNote: "L9 會連動目前計算結果，顯示舒適分數、行距與倍率提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前排版概況", dailyGap: "實際行距", weeklyTrend: "舒適分數", motivation: "動力卡", keepMomentum: "從行高分析走向最舒適易讀的排版節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的行高結果帶回團隊", journeyHint: "用字級數值計算機一起看，把行距與字級大小一併納入可讀性設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用字級數值計算機決定可讀字級", nextActionItem2: "用色彩對比計算機確認文字清晰度", nextActionItem3: "用黃金比例計算機平衡版面留白",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "FontSize → 舒適分數 → 情境 → LineHeight", bmrStep: "FontSize", deficitStep: "舒適分數", trendStep: "情境", mealStep: "LineHeight",
    knowledge: "知識", knowledgeTitle: "行高在排版設計中的意義", definition: "定義", definitionText: "行高是同一行文字基線到下一行基線的距離，以字級的倍率表示；行高越高代表行間距越大，是影響段落可讀性的核心指標。", formula: "公式", formulaText: "實際行距 = 字級 × 倍率。舒適分數 = min(行距 / 目標行距 × 100, 100)。舒適餘量 = (行距 − 目標行距) / 目標行距 × 100%。", limitations: "限制", limitationsText: "本工具以簡化倍率估算；真實行距還受字體 ascent/descent、行距度量與渲染引擎影響，且不同字體的視覺行高差異很大。", interpretation: "解讀", interpretationText: "正文建議 1.4–1.6 倍率；標題可用 1.0–1.3，寬欄長文建議 1.6–1.8，並用舒適分數判斷安全空間。", context: "脈絡", contextText: "行高結果應與字級大小、色彩對比與版面比例一起看，才能在可讀性、美感與無障礙之間取得平衡。", example: "範例", exampleText: "字級 16px、倍率 1.5、標準正文（1.5）→ 行距 24px，舒適餘量 0%，舒適分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "行高的下一步工具", premiumTitle: "PRO 行高分析包", premiumText: "解鎖字體度量精確換算、多字體行高比較、響應式行高建議與段落預覽模擬。", feat1: "字型度量", feat2: "多字型比較", feat3: "響應式行高", feat4: "段落預覽",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供排版規劃與教育用途，不取代正式字體度量計算或排版預覽。", relatedTools: "相關工具", relatedToolsText: "Type Scale · Color Contrast · Golden Ratio · Px-Rem", references: "參考資料", referencesText: "CSS line-height 規範；字體度量標準；可讀性研究文獻；排版設計指南。",
    q1: "行高怎麼算的？", a1: "本工具以字級乘上倍率得出實際行距；真實渲染還需考慮字體的 ascent、descent 與 leading。",
    q2: "舒適分數多少才合理？", a2: "舒適分數達 100 代表行距已達所選情境目標；若低於 100，建議提高倍率或縮小字級。",
    q3: "緊湊還是寬鬆情境？", a3: "標題與導航用緊湊（1.2），一般正文用標準（1.5），寬欄長文或高可讀性需求用寬鬆（1.75）。",
    q4: "行高太低怎麼提升？", a4: "提高倍率、縮小字級、增加行間距，避免使用小於 1.2 的倍率於正文段落。",
    q5: "要不要考慮字體差異？", a5: "需要。不同字體的視覺行高差異很大，同一倍率在不同字體下看起來可能完全不同。",
    q6: "這個工具能取代字體度量嗎？", a6: "不能。它只是快速估算與教育用途；正式排版應以實際字體度量與預覽為準。",
  },
  en: {
    badge: "Design · Line Height · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Line Height Calculator", subtitle: "Compute actual line spacing, comfort score, and optimal ratio from font size, line-height multiplier, and reading context",
    intro: "This calculator uses font size, line-height multiplier, and reading context (compact heading, standard body, or relaxed long-form) to compute actual line spacing, comfort score, and optimal ratio suggestion, helping you judge whether line spacing is comfortable and legible, which multiplier to choose, and whether to widen or compress line spacing, so you compute readability and aesthetics clearly before finalizing typographic parameters.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates line spacing and comfort score from the font size and multiplier you enter, excluding font metrics and rendering differences; for formal typesetting, follow actual font metrics and previews.",
    quickActionCard: "Quick Action Card", tryExample: "Create a line-height example instantly", examplePreview: "Line-height preview", examplePerson: "Font size", fillExample: "One-click standard body example", previewActivePath: "Fill relaxed long-form example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter font size, line-height multiplier, and reading context", examplesHelper: "Start with an example to see how multiplier sets line spacing and comfort score, then replace with your own typesetting data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard body mode", activeExample: "Relaxed long-form demo", baselineExampleNote: "16px · 1.5 · standard", activeExampleNote: "18px · 1.75 · relaxed", carbsLabel: "Comfort margin", carbsName: "percent", proteinLabel: "Comfort score", flowDemo: "Line-height multiplier", calculator: "Calculator",
    weight: "Font size (px)", tdee: "Line-height multiplier", goal: "Reading context", goalCut: "Compact heading (1.2)", goalMaintain: "Standard body (1.5)", goalBulk: "Relaxed long-form (1.75)",
    resultCard: "Line Height Result", unit: "px (line spacing)", primaryValue: "Primary Value", maintenanceTarget: "Comfort score", actionTarget: "Actual spacing", estimatedTdee: "Line-height multiplier", maintenance: "pts", fatLossTarget: "px",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card line-height interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current line-height into common zones. This is typesetting guidance, not a font-metrics conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the line-height result into an actionable typesetting-adjustment strategy", conversionNote: "L9 values update from the computed result: comfort score, line spacing, and multiplier hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current typesetting snapshot", dailyGap: "Actual spacing", weeklyTrend: "Comfort score", motivation: "Motivation Card", keepMomentum: "Move from line-height analysis to the most comfortable reading rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's line-height result to your team", journeyHint: "Review it with the Type Scale Calculator to fold line spacing and font size into readable design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Decide legible type size with the Type Scale Calculator", nextActionItem2: "Confirm text clarity with the Color Contrast Ratio Calculator", nextActionItem3: "Balance layout whitespace with the Golden Ratio Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "FontSize → Comfort → Context → LineHeight", bmrStep: "FontSize", deficitStep: "Comfort", trendStep: "Context", mealStep: "LineHeight",
    knowledge: "Knowledge", knowledgeTitle: "What line height means in typographic design", definition: "Definition", definitionText: "Line height is the distance from one baseline to the next, expressed as a multiplier of the font size; a higher line-height means more space between lines, the core indicator of paragraph readability.", formula: "Formula", formulaText: "Actual spacing = font size × multiplier. Comfort score = min(spacing / target spacing × 100, 100). Comfort margin = (spacing − target spacing) / target spacing × 100%.", limitations: "Limitations", limitationsText: "This tool uses a simplified multiplier estimate; real line spacing is also affected by font ascent/descent, line-gap metrics, and rendering engines, and different fonts have very different visual line heights.", interpretation: "Interpretation", interpretationText: "Body text should use 1.4–1.6×; headings can use 1.0–1.3, wide-column long-form should use 1.6–1.8, and use comfort score to judge safety room.", context: "Context", contextText: "Line-height results should be evaluated with font size, color contrast, and layout ratio to balance readability, aesthetics, and accessibility.", example: "Example", exampleText: "Font size 16px, multiplier 1.5, standard body (1.5) → spacing 24px, comfort margin 0%, comfort score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for line height", premiumTitle: "PRO Line Height Analytics Pack", premiumText: "Unlock precise font-metrics conversion, multi-font line-height comparison, responsive line-height suggestions, and paragraph preview simulation.", feat1: "Font Metrics", feat2: "Multi Font Compare", feat3: "Responsive Line Height", feat4: "Paragraph Preview",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for typesetting planning and education. It does not replace formal font metrics calculation or typesetting previews.", relatedTools: "Related Tools", relatedToolsText: "Type Scale · Color Contrast · Golden Ratio · Px-Rem", references: "References", referencesText: "CSS line-height specification; font metrics standards; readability research literature; typographic design guides.",
    q1: "How is line height calculated?", a1: "This tool multiplies font size by the multiplier to get actual line spacing; real rendering also needs font ascent, descent, and leading.",
    q2: "What comfort score is reasonable?", a2: "A comfort score of 100 means spacing meets the chosen context target; if below 100, raise the multiplier or reduce the font size.",
    q3: "Compact or relaxed context?", a3: "Use compact (1.2) for headings and navigation, standard (1.5) for general body text, and relaxed (1.75) for wide-column or high-legibility needs.",
    q4: "How do I raise a low line height?", a4: "Increase the multiplier, reduce font size, add line spacing, and avoid using multipliers below 1.2 for body paragraphs.",
    q5: "Should I consider font differences?", a5: "Yes. Different fonts have very different visual line heights; the same multiplier can look completely different across fonts.",
    q6: "Can this tool replace font metrics?", a6: "No. It is a quick estimate for education; formal typesetting should follow actual font metrics and previews.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function lineHeightTarget(mode: TierMode): number {
  if (mode === "relaxed") return 1.2;
  if (mode === "fast") return 1.75;
  return 1.5;
}

export default function LineHeightCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("16");
  const [tdee, setTdee] = useState("1.5");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const fontSize = Number(weight);
    const multiplier = Number(tdee);
    if (fontSize <= 0 || multiplier <= 0) return null;
    const spacing = fontSize * multiplier;
    const target = lineHeightTarget(goal);
    const targetSpacing = fontSize * target;
    const comfortScore = Math.min((spacing / targetSpacing) * 100, 100);
    const comfortMargin = ((spacing - targetSpacing) / targetSpacing) * 100;
    return { spacing, targetSpacing, comfortScore, comfortMargin };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.comfortScore, 1) : "—";
  const fatDisplay = result ? fmt(result.spacing, 1) : "—";
  const carbDisplay = result ? fmt(result.comfortMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.spacing, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("16"); setTdee("1.5"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("18"); setTdee("1.75"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">24.0</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">31.5</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">px</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">px</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="line-height-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.spacing, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.comfortScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "FontSize", note: t.bmrStep }, { label: "Comfort", note: t.deficitStep }, { label: "Context", note: t.trendStep }, { label: "LineHeight", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="line-height-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
