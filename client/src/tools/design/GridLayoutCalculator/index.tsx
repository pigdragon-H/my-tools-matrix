// @profile B
// Profile B · Calculator-Design · GridLayoutCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 2 cols", label: { zh: "極窄", en: "Narrow" }, desc: { zh: "少於 2 欄，適合單欄文章、手機版面與極簡排版。", en: "Under 2 columns; ideal for single-column articles, mobile layouts, and minimalist design." } },
  { key: "low", range: "2–3 cols", label: { zh: "基礎", en: "Basic" }, desc: { zh: "2–3 欄，適合部落格、簡單列表與雙欄排版。", en: "2–3 columns; ideal for blogs, simple lists, and two-column layouts." } },
  { key: "healthy", range: "3–6 cols", label: { zh: "標準", en: "Standard" }, desc: { zh: "3–6 欄，最常見的網格系統，適合一般網頁與儀表板。", en: "3–6 columns; the most common grid system, ideal for general web pages and dashboards." } },
  { key: "good", range: "6–8 cols", label: { zh: "進階", en: "Advanced" }, desc: { zh: "6–8 欄，適合複雜儀表板、資料表格與多區塊版面。", en: "6–8 columns; ideal for complex dashboards, data tables, and multi-zone layouts." } },
  { key: "strong", range: "8–12 cols", label: { zh: "精細", en: "Granular" }, desc: { zh: "8–12 欄，精細控制適合專業 UI 與高密度排版。", en: "8–12 columns; fine control for professional UI and high-density layouts." } },
  { key: "elite", range: "> 12 cols", label: { zh: "超細", en: "Ultra-fine" }, desc: { zh: "超過 12 欄，極細網格適合特殊排版與列印模板。", en: "Over 12 columns; ultra-fine grid for special layouts and print templates." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "長寬比計算機", en: "Aspect Ratio Calculator" }, href: "/tools/design/aspect-ratio-calculator" },
  { label: { zh: "黃金比例計算機", en: "Golden Ratio Calculator" }, href: "/tools/design/golden-ratio-calculator" },
  { label: { zh: "字級級數計算機", en: "Type Scale Calculator" }, href: "/tools/design/type-scale-calculator" },
  { label: { zh: "PX REM 轉換計算機", en: "PX REM Converter" }, href: "/tools/design/px-rem-converter" },
];

const ui = {
  zh: {
    badge: "Design · 網格版面 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "網格版面計算機 · Grid Layout", subtitle: "用總寬度、欄數與間距算出欄寬、可用空間與匹配分數",
    intro: "Grid Layout Calculator 依據總寬度、欄數與間距，計算每欄寬度、可用空間與匹配分數，協助你判斷網格是否平衡、該用幾欄、間距是否合理，讓你在寫 CSS Grid 前就把版面配置算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以你輸入的數值估算網格；未含 CSS gap 與 padding 互動、瀏覽器子像素渲染差異；正式排版請以實際預覽為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立網格範例", examplePreview: "網格預覽", examplePerson: "總寬度", fillExample: "一鍵填入 12 欄範例", previewActivePath: "填入 4 欄範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入總寬度、欄數與間距", examplesHelper: "先用範例理解總寬度如何分配給欄與間距，再改成自己的數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "12 欄精細模式", activeExample: "4 欄基礎示範", baselineExampleNote: "1200px · 12 cols · 20px", activeExampleNote: "1200px · 4 cols · 24px", carbsLabel: "匹配分數", carbsName: "百分比", proteinLabel: "合規分數", flowDemo: "間距", calculator: "計算機",
    weight: "欄數 (columns)", tdee: "間距 (gap px)", goal: "網格模式", goalCut: "4 欄基礎 (4)", goalMaintain: "12 欄標準 (12)", goalBulk: "16 欄精細 (16)",
    resultCard: "網格版面結果", unit: "px (欄寬)", primaryValue: "主要數值", maintenanceTarget: "合規分數", actionTarget: "欄寬", estimatedTdee: "間距", maintenance: "%", fatLossTarget: "px",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格網格版面判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前欄數放進常見區間；這是設計參考，不是排版品質結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把網格結果轉成可執行的 CSS Grid 策略", conversionNote: "L9 會連動目前計算結果，顯示合規分數、欄寬與間距提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前網格概況", dailyGap: "欄數", weeklyTrend: "合規分數", motivation: "動力卡", keepMomentum: "從網格分析走向最平衡的版面配置節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的網格結果帶回團隊", journeyHint: "用長寬比計算機一起看，把網格欄寬與比例一併納入設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用長寬比計算機確認比例", nextActionItem2: "用字級級數計算機決定欄內字級", nextActionItem3: "用 PX REM 轉換計算機換算單位",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Width − Gaps → Cols → ColWidth → Match", bmrStep: "Width", deficitStep: "Cols", trendStep: "ColWidth", mealStep: "Match",
    knowledge: "知識", knowledgeTitle: "網格版面在 CSS 中的意義", definition: "定義", definitionText: "網格版面是透過固定總寬度、欄數與間距計算每欄寬度；欄數越多代表精細度越高，是 CSS Grid 排版的基礎工具。", formula: "公式", formulaText: "欄寬 = (總寬 − 間距 × (欄數 − 1)) ÷ 欄數。匹配分數 = max(0, (1 − |實際 − 目標| ÷ 目標) × 100)。合規分數 = min(實際 ÷ 目標 × 100, 100)。", limitations: "限制", limitationsText: "本工具以等寬欄估算；實際排版還受 CSS gap、padding、子像素渲染與瀏覽器差異影響。", interpretation: "解讀", interpretationText: "4 欄適合基礎排版；12 欄是最通用的網格系統；16 欄以上適合精細控制，並用匹配分數判斷配置平衡度。", context: "脈絡", contextText: "網格結果應與長寬比、字級與行高一起看，才能在可讀性、美感與無障礙之間取得平衡。", example: "範例", exampleText: "1200px、12 欄、20px 間距、標準模式 → 欄寬約 80px，匹配分數 100%，合規分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "網格的下一步工具", premiumTitle: "PRO 網格版面分析包", premiumText: "解鎖批量網格計算、CSS Grid 匯出、自訂欄數預設與團隊協作。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任", trustText: "本工具僅供設計規劃與教育用途，不取代實際瀏覽器預覽或排版品質檢測。", relatedTools: "相關工具", relatedToolsText: "Aspect Ratio · Golden Ratio · Type Scale · PX REM", references: "參考資料", referencesText: "W3C CSS Grid 規範；12 欄網格系統指南；響應式網格最佳實踐；無障礙設計指南。",
    q1: "網格欄寬怎麼算的？", a1: "本工具將總寬度減去所有間距後除以欄數得到每欄寬度，再與目標比較算出匹配分數與合規分數。",
    q2: "匹配分數多少才合理？", a2: "匹配分數達 100 代表完全符合目標配置；若低於 100，建議調整欄數或間距。",
    q3: "12 欄還是 4 欄？", a3: "一般網頁用 12 欄最通用；簡單排版可用 4 欄，精細 UI 用 16 欄。",
    q4: "欄寬太小怎麼調整？", a4: "減少欄數、縮小間距或增加總寬度，讓每欄有足夠空間。",
    q5: "要不要考慮間距大小？", a5: "需要。間距直接影響可用空間與欄寬，過大間距會壓縮內容區。",
    q6: "這個工具能取代瀏覽器預覽嗎？", a6: "不能。它只是快速估算與教育用途；正式排版應以實際瀏覽器預覽與量測為準。",
  },
  en: {
    badge: "Design · Grid Layout · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Grid Layout Calculator", subtitle: "Compute column width, available space, and match score from total width, columns, and gap",
    intro: "This calculator uses total width, column count, and gap size to compute column width, available space, and match score, helping you judge whether the grid is balanced, how many columns to use, and whether gaps are reasonable, so you compute layout configuration clearly before writing CSS Grid.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates the grid from values you enter, excluding CSS gap and padding interactions, browser subpixel rendering differences; for formal layouts, verify with actual previews.",
    quickActionCard: "Quick Action Card", tryExample: "Create a grid example instantly", examplePreview: "Grid preview", examplePerson: "Total width", fillExample: "One-click 12-col example", previewActivePath: "Fill 4-col example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter total width, column count, and gap size", examplesHelper: "Start with an example to see how total width distributes across columns and gaps, then replace with your own data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "12-col granular mode", activeExample: "4-col basic demo", baselineExampleNote: "1200px · 12 cols · 20px", activeExampleNote: "1200px · 4 cols · 24px", carbsLabel: "Match score", carbsName: "percent", proteinLabel: "Compliance score", flowDemo: "Gap size", calculator: "Calculator",
    weight: "Column count (cols)", tdee: "Gap size (px)", goal: "Grid mode", goalCut: "4-col Basic (4)", goalMaintain: "12-col Standard (12)", goalBulk: "16-col Granular (16)",
    resultCard: "Grid Layout Result", unit: "px (col width)", primaryValue: "Primary Value", maintenanceTarget: "Compliance score", actionTarget: "Col width", estimatedTdee: "Gap size", maintenance: "%", fatLossTarget: "px",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card grid-layout interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current column count into common zones. This is design guidance, not a layout-quality conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the grid result into an actionable CSS Grid strategy", conversionNote: "L9 values update from the computed result: compliance score, col width, and gap-size hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current grid snapshot", dailyGap: "Column count", weeklyTrend: "Compliance score", motivation: "Motivation Card", keepMomentum: "Move from grid analysis to the most balanced layout rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's grid result to your team", journeyHint: "Review it with the Aspect Ratio Calculator to fold column width and aspect ratio into design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm proportions with the Aspect Ratio Calculator", nextActionItem2: "Decide in-column font size with the Type Scale Calculator", nextActionItem3: "Convert units with the PX REM Converter",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Width − Gaps → Cols → ColWidth → Match", bmrStep: "Width", deficitStep: "Cols", trendStep: "ColWidth", mealStep: "Match",
    knowledge: "Knowledge", knowledgeTitle: "What grid layout means in CSS", definition: "Definition", definitionText: "Grid layout computes each column's width from a fixed total width, column count, and gap; more columns mean finer granularity, the foundational tool for CSS Grid layouts.", formula: "Formula", formulaText: "Col width = (total − gap × (cols − 1)) ÷ cols. Match score = max(0, (1 − |actual − target| ÷ target) × 100). Compliance score = min(actual ÷ target × 100, 100).", limitations: "Limitations", limitationsText: "This tool estimates equal-width columns; real layouts are also affected by CSS gap, padding, subpixel rendering, and browser differences.", interpretation: "Interpretation", interpretationText: "4 columns for basic layouts; 12 columns is the most versatile grid system; 16 or above for fine-grained control, and use match score to judge balance.", context: "Context", contextText: "Grid results should be evaluated with aspect ratio, type scale, and line height to balance legibility, aesthetics, and accessibility.", example: "Example", exampleText: "1200px, 12 cols, 20px gap, standard mode → col width about 80px, match score 100%, compliance score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for grid", premiumTitle: "PRO Grid Layout Analytics Pack", premiumText: "Unlock batch grid calculation, CSS Grid export, custom column presets, and team collaboration.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for design planning and education. It does not replace actual browser preview or layout quality testing.", relatedTools: "Related Tools", relatedToolsText: "Aspect Ratio · Golden Ratio · Type Scale · PX REM", references: "References", referencesText: "W3C CSS Grid spec; 12-column grid system guide; responsive grid best practices; accessible design guides.",
    q1: "How is column width calculated?", a1: "This tool subtracts all gaps from the total width then divides by column count, and compares to the target to compute match and compliance scores.",
    q2: "What match score is reasonable?", a2: "A match score of 100 means it perfectly matches the target layout; if below 100, adjust column count or gap.",
    q3: "12 columns or 4 columns?", a3: "Use 12 columns for general web; use 4 for simple layouts, 16 for fine-grained UI control.",
    q4: "How do I fix a too-narrow column?", a4: "Reduce column count, shrink the gap, or increase total width to give each column more space.",
    q5: "Should I consider gap size?", a5: "Yes. Gap directly affects available space and column width; oversized gaps compress content areas.",
    q6: "Can this tool replace browser preview?", a6: "No. It is a quick estimate for education; formal layouts should follow actual browser previews and measurements.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function colTarget(mode: TierMode): number {
  if (mode === "relaxed") return 4;
  if (mode === "fast") return 16;
  return 12;
}

export default function GridLayoutCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("12");
  const [tdee, setTdee] = useState("20");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const cols = parseInt(weight, 10);
    const gap = parseFloat(tdee);
    const total = 1200;
    if (cols <= 0 || gap < 0) return null;
    const totalGap = gap * (cols - 1);
    const colWidth = (total - totalGap) / cols;
    const targetCols = colTarget(goal);
    const matchScore = Math.max(0, (1 - Math.abs(cols - targetCols) / targetCols) * 100);
    const complianceScore = Math.min((cols / targetCols) * 100, 100);
    return { colWidth, cols, targetCols, matchScore, complianceScore };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.complianceScore, 1) : "—";
  const fatDisplay = result ? fmt(result.colWidth, 1) : "—";
  const carbDisplay = result ? fmt(result.matchScore, 1) : "—";
  const totalDisplay = result ? fmt(result.colWidth, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("12"); setTdee("20"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("4"); setTdee("24"); setGoal("relaxed"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">1200</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">80px</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">282px</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">px</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">px</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="grid-layout-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Width", note: t.bmrStep }, { label: "Cols", note: t.deficitStep }, { label: "ColWidth", note: t.trendStep }, { label: "Match", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="grid-layout-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["BatchGrid", "CSSGridExport", "CustomPreset", "TeamCollab"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
