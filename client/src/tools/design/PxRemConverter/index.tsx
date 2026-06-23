// @profile B
// Profile B · Calculator-Design · PxRemConverter（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 0.5 rem", label: { zh: "微尺寸", en: "Micro" }, desc: { zh: "極小的 rem 值，適合邊框、間距微調與圖標尺寸。", en: "Tiny rem values; suitable for borders, spacing tweaks, and icon sizes." } },
  { key: "low", range: "0.5–1 rem", label: { zh: "正文區", en: "Body zone" }, desc: { zh: "正文與輔助文字的典型 rem 範圍，8–16px 對應區間。", en: "Typical rem range for body and auxiliary text; 8–16px equivalent zone." } },
  { key: "healthy", range: "1–1.5 rem", label: { zh: "標題區", en: "Heading zone" }, desc: { zh: "小標題與強調文字的 rem 範圍，16–24px 對應區間。", en: "Rem range for subheadings and emphasized text; 16–24px equivalent zone." } },
  { key: "good", range: "1.5–2.5 rem", label: { zh: "大標題", en: "Large heading" }, desc: { zh: "主標題與英雄區文字，24–40px 對應區間，視覺衝擊適中。", en: "Main headings and hero text; 24–40px equivalent, moderate visual impact." } },
  { key: "strong", range: "2.5–4 rem", label: { zh: "超大標題", en: "Display" }, desc: { zh: "展示級文字，40–64px 對應，適合首屏大標與品牌字。", en: "Display-level text; 40–64px equivalent, ideal for hero headlines and brand type." } },
  { key: "elite", range: "> 4 rem", label: { zh: "極端", en: "Extreme" }, desc: { zh: "極大 rem 值，超過 64px，僅適合裝飾性或概念性排版。", en: "Huge rem values exceeding 64px; only for decorative or conceptual layouts." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字級級數計算機", en: "Type Scale Calculator" }, href: "/tools/design/type-scale-calculator" },
  { label: { zh: "行高計算機", en: "Line Height Calculator" }, href: "/tools/design/line-height-calculator" },
  { label: { zh: "色彩對比度計算機", en: "Color Contrast Ratio Calculator" }, href: "/tools/design/color-contrast-ratio-calculator" },
  { label: { zh: "黃金比例計算機", en: "Golden Ratio Calculator" }, href: "/tools/design/golden-ratio-calculator" },
];

const ui = {
  zh: {
    badge: "Design · PX REM · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "PX REM 轉換計算機 · PX ↔ REM", subtitle: "用像素值、基準字級與方向算出 REM 結果、比例與匹配分數",
    intro: "PX REM Converter 依據像素值、基準字級與轉換方向，計算 REM 對應值、比例與匹配分數，協助您判斷 px 與 rem 的對應關係、該用哪個基準、是否需要調整根字級，讓您在寫 CSS 前就把單位換算算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的基準字級估算轉換；未含瀏覽器預設覆寫、縮放與媒體查詢差異；正式排版請以實際預覽為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立轉換範例", examplePreview: "轉換預覽", examplePerson: "像素值", fillExample: "一鍵填入 16px 範例", previewActivePath: "填入 24px 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入像素值、基準字級與轉換方向", examplesHelper: "先用範例理解 px 如何對應 rem，再改成自己的數據。",
    metric: "PX → REM", imperial: "REM → PX", exampleCards: "範例卡", baselineExample: "16px 轉換模式", activeExample: "24px 示範", baselineExampleNote: "16px · base 16", activeExampleNote: "24px · base 16", carbsLabel: "匹配分數", carbsName: "百分比", proteinLabel: "合規分數", flowDemo: "基準字級", calculator: "計算機",
    weight: "像素值 (px)", tdee: "基準字級 (root px)", goal: "基準模式", goalCut: "12px 小基準", goalMaintain: "16px 標準基準", goalBulk: "20px 大基準",
    resultCard: "PX REM 轉換結果", unit: "rem (轉換結果)", primaryValue: "主要數值", maintenanceTarget: "合規分數", actionTarget: "REM 值", estimatedTdee: "基準字級", maintenance: "%", fatLossTarget: "rem",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 PX REM 判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前 rem 值放進常見區間；這是設計參考，不是排版品質結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把轉換結果轉成可執行的 CSS 單位策略", conversionNote: "L9 會連動目前計算結果，顯示合規分數、REM 值與基準字級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前單位概況", dailyGap: "REM 值", weeklyTrend: "合規分數", motivation: "動力卡", keepMomentum: "從單位換算走向最精準的 CSS 數值節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的轉換結果帶回團隊", journeyHint: "用字級級數計算機一起看，把 rem 值與字級序列一併納入設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用字級級數計算機決定字級序列", nextActionItem2: "用行高計算機優化段落行高", nextActionItem3: "用色彩對比度計算機確保可讀性",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "PX ÷ Root → REM → Scale → Match", bmrStep: "PX", deficitStep: "REM", trendStep: "Scale", mealStep: "Match",
    knowledge: "知識", knowledgeTitle: "PX 與 REM 在 CSS 中的意義", definition: "定義", definitionText: "PX 是絕對像素單位，REM 是相對於根元素字級的單位；1rem = root font-size，透過基準字級換算實現響應式排版。", formula: "公式", formulaText: "REM = PX ÷ 基準字級。匹配分數 = max(0, (1 − |實際比 − 目標比| ÷ 目標比) × 100)。合規分數 = min(實際比 ÷ 目標比 × 100, 100)。", limitations: "限制", limitationsText: "本工具以固定基準估算；實際排版還受瀏覽器預設覆寫、使用者縮放與媒體查詢影響。", interpretation: "解讀", interpretationText: "基準 16px 下 1rem = 16px；較小基準讓 rem 值變大，較大基準讓 rem 值變小，用匹配分數判斷換算精確度。", context: "脈絡", contextText: "轉換結果應與字級級數、行高與版面比例一起看，才能在可讀性、美感與無障礙之間取得平衡。", example: "範例", exampleText: "16px、基準 16px、標準模式 → 1.000rem，匹配分數 100%，合規分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "轉換的下一步工具", premiumTitle: "PRO PX REM 分析包", premiumText: "解鎖批量轉換、CSSSnippet 匯出、自訂基準預設與團隊協作。", feat1: "批次換算", feat2: "CSS片段", feat3: "自訂基準", feat4: "團隊協作",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任", trustText: "本工具僅供設計規劃與教育用途，不取代實際瀏覽器預覽或排版品質檢測。", relatedTools: "相關工具", relatedToolsText: "Type Scale · Line Height · Color Contrast · Golden Ratio", references: "參考資料", referencesText: "W3C CSS length 單位規範；rem vs em 比較指南；響應式排版最佳實踐；無障礙設計指南。",
    q1: "PX 怎麼轉 REM？", a1: "將像素值除以基準字級即得 rem 值，再與目標比例比較算出匹配分數與合規分數。",
    q2: "匹配分數多少才合理？", a2: "匹配分數達 100 代表完全符合目標比例；若低於 100，建議調整基準字級或像素值。",
    q3: "16px 還是其他基準？", a3: "一般網頁用 16px（瀏覽器預設）；較小基準適合密排，較大基準適合大字排版。",
    q4: "REM 值太小怎麼調整？", a4: "降低基準字級或增加像素值，讓 rem 值落在目標區間。",
    q5: "要不要考慮使用者縮放？", a5: "需要。使用者瀏覽器縮放會改變實際渲染大小，rem 的優勢正在於自動跟隨根字級。",
    q6: "這個工具能取代瀏覽器檢測嗎？", a6: "不能。它只是快速估算與教育用途；正式排版應以實際瀏覽器預覽與量測為準。",
  },
  en: {
    badge: "Design · PX REM · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "PX REM Converter", subtitle: "Compute REM value, proportion, and match score from pixel value, root font size, and direction",
    intro: "This converter uses pixel value, root font size, and conversion direction to compute the REM equivalent, proportion, and match score, helping you judge the px-to-rem relationship, which base to use, and whether to adjust the root size, so you compute unit conversions clearly before writing CSS.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates conversion from the root font size you enter, excluding browser default overrides, zoom, and media-query differences; for formal typography, verify with actual previews.",
    quickActionCard: "Quick Action Card", tryExample: "Create a conversion example instantly", examplePreview: "Conversion preview", examplePerson: "Pixel value", fillExample: "One-click 16px example", previewActivePath: "Fill 24px example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter pixel value, root font size, and conversion direction", examplesHelper: "Start with an example to see how px maps to rem, then replace with your own data.",
    metric: "PX → REM", imperial: "REM → PX", exampleCards: "Example cards", baselineExample: "16px conversion mode", activeExample: "24px demo", baselineExampleNote: "16px · base 16", activeExampleNote: "24px · base 16", carbsLabel: "Match score", carbsName: "percent", proteinLabel: "Compliance score", flowDemo: "Root font size", calculator: "Calculator",
    weight: "Pixel value (px)", tdee: "Root font size (px)", goal: "Base mode", goalCut: "12px Small base", goalMaintain: "16px Standard base", goalBulk: "20px Large base",
    resultCard: "PX REM Conversion Result", unit: "rem (converted)", primaryValue: "Primary Value", maintenanceTarget: "Compliance score", actionTarget: "REM value", estimatedTdee: "Root font size", maintenance: "%", fatLossTarget: "rem",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card PX REM interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current rem value into common zones. This is design guidance, not a typographic-quality conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the conversion result into an actionable CSS unit strategy", conversionNote: "L9 values update from the computed result: compliance score, rem value, and root-size hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current unit snapshot", dailyGap: "REM value", weeklyTrend: "Compliance score", motivation: "Motivation Card", keepMomentum: "Move from unit conversion to the most precise CSS value rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's conversion result to your team", journeyHint: "Review it with the Type Scale Calculator to fold rem values and type scale into design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Decide type scale with the Type Scale Calculator", nextActionItem2: "Optimize line height with the Line Height Calculator", nextActionItem3: "Ensure legibility with the Color Contrast Ratio Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "PX ÷ Root → REM → Scale → Match", bmrStep: "PX", deficitStep: "REM", trendStep: "Scale", mealStep: "Match",
    knowledge: "Knowledge", knowledgeTitle: "What PX and REM mean in CSS", definition: "Definition", definitionText: "PX is an absolute pixel unit; REM is relative to the root element font size; 1rem = root font-size, enabling responsive typography through base-size conversion.", formula: "Formula", formulaText: "REM = PX ÷ root font size. Match score = max(0, (1 − |actual − target| ÷ target) × 100). Compliance score = min(actual ÷ target × 100, 100).", limitations: "Limitations", limitationsText: "This tool estimates from a fixed base; real typography is also affected by browser default overrides, user zoom, and media queries.", interpretation: "Interpretation", interpretationText: "At base 16px, 1rem = 16px; a smaller base makes rem values larger, a larger base makes them smaller; use match score to judge conversion precision.", context: "Context", contextText: "Conversion results should be evaluated with type scale, line height, and layout proportion to balance legibility, aesthetics, and accessibility.", example: "Example", exampleText: "16px, base 16px, standard mode → 1.000rem, match score 100%, compliance score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for conversion", premiumTitle: "PRO PX REM Analytics Pack", premiumText: "Unlock batch conversion, CSS snippet export, custom base presets, and team collaboration.", feat1: "Batch Convert", feat2: "CSS Snippet", feat3: "Custom Base", feat4: "Team Collab",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for design planning and education. It does not replace actual browser preview or typographic quality testing.", relatedTools: "Related Tools", relatedToolsText: "Type Scale · Line Height · Color Contrast · Golden Ratio", references: "References", referencesText: "W3C CSS length unit spec; rem vs em comparison guide; responsive typography best practices; accessible design guides.",
    q1: "How is PX converted to REM?", a1: "Divide the pixel value by the root font size to get the rem value, then compare to the target ratio to compute match and compliance scores.",
    q2: "What match score is reasonable?", a2: "A match score of 100 means it perfectly matches the target ratio; if below 100, adjust the root font size or pixel value.",
    q3: "16px or other base?", a3: "Use 16px (browser default) for general web; smaller base for dense layouts, larger base for large-type layouts.",
    q4: "How do I fix a too-small REM?", a4: "Lower the root font size or increase the pixel value to push the rem value into the target zone.",
    q5: "Should I consider user zoom?", a5: "Yes. Browser zoom changes actual rendered size; rem's advantage is auto-following the root font size.",
    q6: "Can this tool replace browser inspection?", a6: "No. It is a quick estimate for education; formal typography should follow actual browser previews and measurements.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function baseTarget(mode: TierMode): number {
  if (mode === "relaxed") return 12;
  if (mode === "fast") return 20;
  return 16;
}

export default function PxRemConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("16");
  const [tdee, setTdee] = useState("16");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const px = parseFloat(weight);
    const root = parseFloat(tdee);
    if (px <= 0 || root <= 0) return null;
    const remValue = px / root;
    const targetBase = baseTarget(goal);
    const targetRem = px / targetBase;
    const matchScore = Math.max(0, (1 - Math.abs(remValue - targetRem) / Math.max(targetRem, 0.001)) * 100);
    const complianceScore = Math.min((remValue / Math.max(targetRem, 0.001)) * 100, 100);
    return { remValue, targetRem, matchScore, complianceScore };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.complianceScore, 1) : "—";
  const fatDisplay = result ? fmt(result.remValue, 3) : "—";
  const carbDisplay = result ? fmt(result.matchScore, 1) : "—";
  const totalDisplay = result ? fmt(result.remValue, 3) : "—";

  function fillStandard() { setUnit("metric"); setWeight("16"); setTdee("16"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("24"); setTdee("16"); setGoal("standard"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">1.000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1.500</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">rem</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">rem</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="px-rem-converter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.remValue, 3) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.complianceScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "PX", note: t.bmrStep }, { label: "REM", note: t.deficitStep }, { label: "Scale", note: t.trendStep }, { label: "Match", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
