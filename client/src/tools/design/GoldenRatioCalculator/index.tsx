// @profile B
// Profile B · Calculator-Design · GoldenRatioCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 50", label: { zh: "細部", en: "Detail" }, desc: { zh: "細部尺寸區間，適合圖示、間距與小元件的黃金切分基準。", en: "Detail-size band; good golden baseline for icons, spacing, and small components." } },
  { key: "low", range: "50–150", label: { zh: "元件", en: "Component" }, desc: { zh: "元件尺寸區間，按鈕、卡片與輸入框的黃金比例常落於此。", en: "Component-size band; buttons, cards, and inputs often land here under golden ratio." } },
  { key: "healthy", range: "150–400", label: { zh: "區塊", en: "Block" }, desc: { zh: "區塊尺寸區間，側欄與主欄分割的常見黃金切分範圍。", en: "Block-size band; common golden split range for sidebars and main columns." } },
  { key: "good", range: "400–800", label: { zh: "版面", en: "Layout" }, desc: { zh: "版面尺寸區間，整頁主視覺與內容區的黃金分割好選擇。", en: "Layout-size band; a good golden split for full-page hero and content areas." } },
  { key: "strong", range: "800–1400", label: { zh: "全寬", en: "Full-width" }, desc: { zh: "全寬尺寸區間，桌機版面與大型橫幅的黃金比例參考。", en: "Full-width band; golden ratio reference for desktop layouts and large banners." } },
  { key: "elite", range: "> 1400", label: { zh: "超寬", en: "Ultra-wide" }, desc: { zh: "超寬尺寸區間，寬螢幕與多欄版面需留意黃金切分的視覺平衡。", en: "Ultra-wide band; mind golden-split visual balance on wide screens and multi-column layouts." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "色彩對比度計算機", en: "Color Contrast Ratio Calculator" }, href: "/tools/design/color-contrast-ratio-calculator" },
  { label: { zh: "長寬比計算機", en: "Aspect Ratio Calculator" }, href: "/tools/design/aspect-ratio-calculator" },
  { label: { zh: "字級級數計算機", en: "Type Scale Calculator" }, href: "/tools/design/type-scale-calculator" },
  { label: { zh: "網格版面計算機", en: "Grid Layout Calculator" }, href: "/tools/design/grid-layout-calculator" },
];

const ui = {
  zh: {
    badge: "Design · 黃金比例 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "黃金比例計算機 · Golden Ratio", subtitle: "用基準長度、次要長度與比例精度算出黃金切分、比例吻合度與和諧分數",
    intro: "Golden Ratio Calculator 依據基準長度、次要長度與目標比例精度（粗略、黃金 φ 或近似完全五度），計算黃金切分長度、比例吻合度與和諧分數，協助您判斷版面分割是否符合黃金比例、該選哪段尺寸、是否需要微調比例，讓您在排版與構圖前就把黃金分割算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的長度與比例精度估算黃金切分，未含視覺權重、留白與內容密度差異；正式設計仍需以實際排版與視覺校稿為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立比例範例", examplePreview: "比例預覽", examplePerson: "基準長度", fillExample: "一鍵填入黃金 φ 範例", previewActivePath: "填入完全五度範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入基準長度、次要長度與比例精度", examplesHelper: "先用範例理解長度比如何決定黃金切分與和諧分數，再改成自己的版面數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "黃金 φ 模式", activeExample: "完全五度示範", baselineExampleNote: "基準 618 · 次要 382 · φ", activeExampleNote: "基準 618 · 次要 382 · 五度", carbsLabel: "比例吻合度", carbsName: "百分比", proteinLabel: "和諧分數", flowDemo: "次要長度", calculator: "計算機",
    weight: "基準長度 (px)", tdee: "次要長度 (px)", goal: "比例精度", goalCut: "粗略 (1.5)", goalMaintain: "黃金 φ (1.618)", goalBulk: "完全五度 (1.667)",
    resultCard: "黃金比例結果", unit: ": 1 (實際比例)", primaryValue: "主要數值", maintenanceTarget: "和諧分數", actionTarget: "實際比例", estimatedTdee: "次要長度", maintenance: "%", fatLossTarget: ": 1",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格尺寸判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前基準長度放進常見區間；這是設計參考，不是排版定論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把比例結果轉成可執行的版面分割策略", conversionNote: "L9 會連動目前計算結果，顯示和諧分數、實際比例與次要長度提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前版面概況", dailyGap: "實際比例", weeklyTrend: "和諧分數", motivation: "動力卡", keepMomentum: "從比例分析走向最和諧的版面分割節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的比例結果帶回團隊", journeyHint: "用網格版面計算機一起看，把黃金切分與欄位網格一併納入排版規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用網格版面計算機建立黃金欄位", nextActionItem2: "用長寬比計算機統一畫面比例", nextActionItem3: "用字級級數計算機呼應黃金節奏",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Base → 和諧分數 → 精度 → 次要", bmrStep: "Base", deficitStep: "和諧分數", trendStep: "精度", mealStep: "次要",
    knowledge: "知識", knowledgeTitle: "黃金比例在版面設計中的意義", definition: "定義", definitionText: "黃金比例是把基準長度除以次要長度得到的實際比值，與目標精度（如 φ≈1.618）比較；比值越接近 φ 代表分割越和諧，是構圖與版面平衡的經典指標。", formula: "公式", formulaText: "實際比例 = 基準長度 ÷ 次要長度。比例吻合度 = (1 − |實際比例 − 精度| ÷ 精度) × 100%。和諧分數 = min(吻合度, 100)。黃金切分 = 基準長度 ÷ 精度。", limitations: "限制", limitationsText: "本工具以單一長度比估算；真實視覺和諧還受視覺權重、留白、內容密度、色彩與動線影響，且黃金比例為美學參考非硬性規則。", interpretation: "解讀", interpretationText: "和諧分數越接近 100 代表越貼近所選比例；若偏低，可調整次要長度或改用黃金切分建議值重新分割版面。", context: "脈絡", contextText: "比例結果應與網格版面、長寬比與字級級數一起看，才能在和諧、可讀性與視覺平衡之間取得統一。", example: "範例", exampleText: "基準 618 px、次要 382 px、黃金 φ（1.618）→ 實際比例約 1.618:1，比例吻合度約 100%，和諧分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "比例的下一步工具", premiumTitle: "PRO 黃金比例分析包", premiumText: "解鎖斐波那契數列產生、多段黃金切分、響應式比例縮放與多版面和諧比較矩陣。", feat1: "費氏數列", feat2: "多段分割", feat3: "響應式縮放", feat4: "和諧矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供設計規劃與教育用途，不取代專業排版、視覺校稿或品牌規範。", relatedTools: "相關工具", relatedToolsText: "Color Contrast · Aspect Ratio · Type Scale · Grid Layout", references: "參考資料", referencesText: "黃金比例與斐波那契數列；構圖比例理論；版面網格系統指南；視覺平衡設計研究。",
    q1: "黃金比例怎麼算的？", a1: "本工具以基準長度除以次要長度得實際比例，再與目標精度比較得吻合度；越接近 φ≈1.618 越和諧。",
    q2: "和諧分數多少才合理？", a2: "和諧分數接近 100 代表貼近所選比例；若偏低，建議調整次要長度或採用黃金切分建議值。",
    q3: "黃金 φ 還是完全五度？", a3: "經典構圖用黃金 φ（1.618）；音樂性節奏感或更緊湊的分割可用完全五度（1.667），依設計風格選擇。",
    q4: "比例不和諧怎麼改？", a4: "依黃金切分建議值調整次要長度、統一網格基準、減少破壞比例的元素，並用視覺校稿確認平衡。",
    q5: "黃金比例是硬性規則嗎？", a5: "不是。它是美學參考；實際設計仍需兼顧內容、品牌與可用性，靈活運用而非機械套用。",
    q6: "這個工具能取代專業排版嗎？", a6: "不能。它只是快速估算與教育用途；正式設計應以專業排版與視覺校稿為準。",
  },
  en: {
    badge: "Design · Golden Ratio · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Golden Ratio Calculator", subtitle: "Compute golden split, ratio match, and harmony score from base length, secondary length, and ratio precision",
    intro: "This calculator uses base length, secondary length, and target ratio precision (rough, golden φ, or perfect-fifth approximation) to compute golden split length, ratio match, and harmony score, helping you judge whether a layout split follows the golden ratio, which size segment to use, and whether to fine-tune the ratio, so you compute golden division clearly before layout and composition.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates golden split from the lengths and ratio precision you enter, excluding visual weight, whitespace, and content-density differences; formal design still needs actual layout and visual proofing.",
    quickActionCard: "Quick Action Card", tryExample: "Create a ratio example instantly", examplePreview: "Ratio preview", examplePerson: "Base length", fillExample: "One-click golden φ example", previewActivePath: "Fill perfect-fifth example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter base length, secondary length, and ratio precision", examplesHelper: "Start with an example to see how the length ratio sets the golden split and harmony score, then replace with your own layout data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Golden φ mode", activeExample: "Perfect-fifth demo", baselineExampleNote: "base 618 · secondary 382 · φ", activeExampleNote: "base 618 · secondary 382 · fifth", carbsLabel: "Ratio match", carbsName: "percent", proteinLabel: "Harmony score", flowDemo: "Secondary length", calculator: "Calculator",
    weight: "Base length (px)", tdee: "Secondary length (px)", goal: "Ratio precision", goalCut: "Rough (1.5)", goalMaintain: "Golden φ (1.618)", goalBulk: "Perfect fifth (1.667)",
    resultCard: "Golden Ratio Result", unit: ": 1 (actual ratio)", primaryValue: "Primary Value", maintenanceTarget: "Harmony score", actionTarget: "Actual ratio", estimatedTdee: "Secondary length", maintenance: "%", fatLossTarget: ": 1",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card size interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current base length into common zones. This is design guidance, not a layout conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the ratio result into an actionable layout-split strategy", conversionNote: "L9 values update from the computed result: harmony score, actual ratio, and secondary-length hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current layout snapshot", dailyGap: "Actual ratio", weeklyTrend: "Harmony score", motivation: "Motivation Card", keepMomentum: "Move from ratio analysis to the most harmonious layout-split rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's ratio result to your team", journeyHint: "Review it with the Grid Layout Calculator to fold golden split and column grid into layout planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Build golden columns with the Grid Layout Calculator", nextActionItem2: "Unify screen ratio with the Aspect Ratio Calculator", nextActionItem3: "Echo the golden rhythm with the Type Scale Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Base → Harmony → Precision → Secondary", bmrStep: "Base", deficitStep: "Harmony", trendStep: "Precision", mealStep: "Secondary",
    knowledge: "Knowledge", knowledgeTitle: "What the golden ratio means in layout design", definition: "Definition", definitionText: "The golden ratio divides base length by secondary length for the actual ratio, compared to a target precision (such as φ≈1.618); the closer the ratio is to φ the more harmonious the split, a classic indicator of composition and layout balance.", formula: "Formula", formulaText: "Actual ratio = base length ÷ secondary length. Ratio match = (1 − |actual ratio − precision| ÷ precision) × 100%. Harmony score = min(match, 100). Golden split = base length ÷ precision.", limitations: "Limitations", limitationsText: "This tool estimates from a single length ratio; real visual harmony is also affected by visual weight, whitespace, content density, color, and flow, and the golden ratio is an aesthetic reference, not a hard rule.", interpretation: "Interpretation", interpretationText: "A harmony score near 100 means it closely matches the chosen ratio; if low, adjust the secondary length or re-split the layout using the golden-split suggested value.", context: "Context", contextText: "Ratio results should be evaluated with grid layout, aspect ratio, and type scale to unify harmony, legibility, and visual balance.", example: "Example", exampleText: "Base 618 px, secondary 382 px, golden φ (1.618) → actual ratio about 1.618:1, ratio match about 100%, harmony score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for ratio", premiumTitle: "PRO Golden Ratio Analytics Pack", premiumText: "Unlock Fibonacci sequence generation, multi-segment golden splits, responsive ratio scaling, and a multi-layout harmony comparison matrix.", feat1: "Fibonacci", feat2: "Multi Split", feat3: "Responsive Scale", feat4: "Harmony Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for design planning and education. It does not replace professional layout, visual proofing, or brand guidelines.", relatedTools: "Related Tools", relatedToolsText: "Color Contrast · Aspect Ratio · Type Scale · Grid Layout", references: "References", referencesText: "Golden ratio and Fibonacci sequence; composition ratio theory; layout grid system guides; visual balance design research.",
    q1: "How is the golden ratio calculated?", a1: "This tool divides base length by secondary length for the actual ratio, then compares to target precision for the match; the closer to φ≈1.618 the more harmonious.",
    q2: "What harmony score is reasonable?", a2: "A harmony score near 100 means it closely matches the chosen ratio; if low, adjust the secondary length or adopt the golden-split suggested value.",
    q3: "Golden φ or perfect fifth?", a3: "Use golden φ (1.618) for classic composition; use perfect fifth (1.667) for musical rhythm or tighter splits, depending on design style.",
    q4: "How do I fix a disharmonious ratio?", a4: "Adjust the secondary length to the golden-split suggested value, unify the grid baseline, reduce ratio-breaking elements, and confirm balance with visual proofing.",
    q5: "Is the golden ratio a hard rule?", a5: "No. It is an aesthetic reference; real design still balances content, brand, and usability—apply it flexibly, not mechanically.",
    q6: "Can this tool replace professional layout?", a6: "No. It is a quick estimate for education; formal design should follow professional layout and visual proofing.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function phiPrecision(mode: TierMode): number {
  if (mode === "relaxed") return 1.5;
  if (mode === "fast") return 1.667;
  return 1.618;
}

export default function GoldenRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("618");
  const [tdee, setTdee] = useState("382");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const base = Number(weight);
    const secondary = Number(tdee);
    if (base <= 0 || secondary <= 0) return null;
    const precision = phiPrecision(goal);
    const actualRatio = base / secondary;
    const ratioMatch = (1 - Math.abs(actualRatio - precision) / precision) * 100;
    const harmonyScore = Math.min(Math.max(ratioMatch, 0), 100);
    const goldenSplit = base / precision;
    return { actualRatio, ratioMatch, harmonyScore, goldenSplit };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.harmonyScore, 1) : "—";
  const fatDisplay = result ? fmt(result.actualRatio, 3) : "—";
  const carbDisplay = result ? fmt(result.ratioMatch, 1) : "—";
  const totalDisplay = result ? fmt(result.actualRatio, 3) : "—";

  function fillStandard() { setUnit("metric"); setWeight("618"); setTdee("382"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("618"); setTdee("382"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">1.618</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1.618</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">:1</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">:1</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="golden-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.actualRatio, 3) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.harmonyScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Base", note: t.bmrStep }, { label: "Harmony", note: t.deficitStep }, { label: "Precision", note: t.trendStep }, { label: "Secondary", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="golden-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
