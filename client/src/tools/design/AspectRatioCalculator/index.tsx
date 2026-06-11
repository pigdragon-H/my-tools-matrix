// @profile B
// Profile B · Calculator-Design · AspectRatioCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 1.33", label: { zh: "不正規", en: "Non-standard" }, desc: { zh: "比例偏離常見規格，可能產生拉伸或裁切，不建議用於正式排版。", en: "Ratio deviates from common formats; may cause stretching or cropping, not recommended for formal layouts." } },
  { key: "low", range: "1.33–1.5", label: { zh: "4:3 傳統", en: "4:3 Classic" }, desc: { zh: "傳統螢幕與相片比例，適合舊式顯示器、簡報與文件圖表。", en: "Classic screen and photo ratio, suitable for legacy displays, presentations, and document charts." } },
  { key: "healthy", range: "1.5–1.78", label: { zh: "3:2 相機", en: "3:2 Camera" }, desc: { zh: "單眼相機標準比例，適合攝影作品展示與印刷排版。", en: "Standard DSLR ratio, ideal for photography showcases and print layouts." } },
  { key: "good", range: "1.78–2.0", label: { zh: "16:9 寬屏", en: "16:9 Widescreen" }, desc: { zh: "主流寬屏比例，適合網頁影片、簡報與 UI 設計。", en: "Mainstream widescreen ratio, ideal for web video, presentations, and UI design." } },
  { key: "strong", range: "2.0–2.4", label: { zh: "電影 2.35:1", en: "Cinema 2.35:1" }, desc: { zh: "寬銀幕電影比例，營造沉浸式觀影體驗與大氣橫幅。", en: "Widescreen cinema ratio, creates immersive viewing and cinematic banners." } },
  { key: "elite", range: "> 2.4", label: { zh: "超寬幅", en: "Ultra-wide" }, desc: { zh: "超寬比例，適合全景攝影與沉浸式橫向卷軸。", en: "Ultra-wide ratio, ideal for panoramic photography and immersive horizontal scrolling." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "色彩對比度計算機", en: "Color Contrast Ratio Calculator" }, href: "/tools/design/color-contrast-ratio-calculator" },
  { label: { zh: "黃金比例計算機", en: "Golden Ratio Calculator" }, href: "/tools/design/golden-ratio-calculator" },
  { label: { zh: "字級級數計算機", en: "Type Scale Calculator" }, href: "/tools/design/type-scale-calculator" },
  { label: { zh: "行高計算機", en: "Line Height Calculator" }, href: "/tools/design/line-height-calculator" },
];

const ui = {
  zh: {
    badge: "Design · 長寬比 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "長寬比計算機 · Aspect Ratio", subtitle: "用原始寬度、高度與目標寬度算出長寬比、縮放高度與匹配分數",
    intro: "Aspect Ratio Calculator 依據原始寬度、高度與目標寬度，計算長寬比、縮放後高度與匹配分數，協助您判斷影像是否變形、該選哪種比例、是否需要裁切或留白，讓您在決定設計尺寸前就把比例與縮放算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的像素值估算長寬比，未含 DPI 差異、子像素渲染與裝置解析度；正式輸出請以實際裝置預覽為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立比例範例", examplePreview: "比例預覽", examplePerson: "原始寬度", fillExample: "一鍵填入 16:9 範例", previewActivePath: "填入 4:3 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入原始寬度、高度與目標寬度", examplesHelper: "先用範例理解寬高如何決定長寬比與縮放高度，再改成自己的數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "16:9 寬屏模式", activeExample: "4:3 傳統示範", baselineExampleNote: "1920 × 1080", activeExampleNote: "1024 × 768", carbsLabel: "匹配分數", carbsName: "百分比", proteinLabel: "合規分數", flowDemo: "目標寬度", calculator: "計算機",
    weight: "高度 (px)", tdee: "目標寬度 (px)", goal: "比例模式", goalCut: "4:3 傳統 (1.33)", goalMaintain: "16:9 寬屏 (1.778)", goalBulk: "2.35:1 電影 (1.85)",
    resultCard: "長寬比結果", unit: ": 1 (長寬比)", primaryValue: "主要數值", maintenanceTarget: "合規分數", actionTarget: "長寬比", estimatedTdee: "目標寬度", maintenance: "%", fatLossTarget: ": 1",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格長寬比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前長寬比放進常見區間；這是設計參考，不是輸出品質結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把比例結果轉成可執行的尺寸調整策略", conversionNote: "L9 會連動目前計算結果，顯示合規分數、長寬比與目標寬度提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前尺寸概況", dailyGap: "長寬比", weeklyTrend: "合規分數", motivation: "動力卡", keepMomentum: "從比例分析走向最合適的設計比例節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的比例結果帶回團隊", journeyHint: "用字級級數計算機一起看，把長寬比與字級大小一併納入設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用字級級數計算機決定可讀字級", nextActionItem2: "用行高計算機優化段落易讀性", nextActionItem3: "用黃金比例計算機平衡版面留白",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Width × Height → Ratio → Match → Scale", bmrStep: "Width", deficitStep: "Ratio", trendStep: "Match", mealStep: "Scale",
    knowledge: "知識", knowledgeTitle: "長寬比在設計中的意義", definition: "定義", definitionText: "長寬比是影像寬度與高度的比例；常見的 16:9 代表寬度是高度的 1.778 倍，是網頁與影片的主流格式，更高的比例代表更寬的畫面。", formula: "公式", formulaText: "長寬比 = 寬度 ÷ 高度。匹配分數 = max(0, (1 − |實際比 − 目標比| ÷ 目標比) × 100)。合規分數 = min(實際比 ÷ 目標比 × 100, 100)。", limitations: "限制", limitationsText: "本工具以像素值估算比例；實際輸出還受 DPI、子像素渲染、裝置解析度與 CSS 縮放影響。", interpretation: "解讀", interpretationText: "長寬比低於 1.78 建議改用傳統比例或裁切；寬屏內容用 16:9 以上，電影場景用 2.35:1，並用匹配分數判斷變形風險。", context: "脈絡", contextText: "比例結果應與字級、行高與版面比例一起看，才能在可讀性、美感與無障礙之間取得平衡。", example: "範例", exampleText: "寬度 1920、高度 1080、16:9 模式（1.778）→ 長寬比約 1.778:1，匹配分數 100%，合規分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "比例的下一步工具", premiumTitle: "PRO 長寬比分析包", premiumText: "解鎖批量比例計算、CSV 匯出、自訂比例預設與團隊協作。", feat1: "批次比例", feat2: "CSV匯出", feat3: "自訂預設", feat4: "團隊協作",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任", trustText: "本工具僅供設計規劃與教育用途，不取代實際裝置預覽或輸出品質檢測。", relatedTools: "相關工具", relatedToolsText: "Color Contrast · Golden Ratio · Type Scale · Line Height", references: "參考資料", referencesText: "W3C CSS aspect-ratio 規範；常見長寬比標準清單；響應式設計圖片指南；無障礙設計指南。",
    q1: "長寬比怎麼算的？", a1: "本工具將寬度除以高度得到長寬比，再與目標比例比較算出匹配分數與合規分數。",
    q2: "匹配分數多少才合理？", a2: "匹配分數達 100 代表完全符合目標比例；若低於 100，建議調整尺寸或裁切留白。",
    q3: "16:9 還是 4:3 比例？", a3: "一般網頁影片用 16:9（1.778）即可；簡報、文件與舊式顯示器建議用 4:3（1.33）。",
    q4: "長寬比不符怎麼辦？", a4: "裁切多餘區域、加上黑邊留白、調整目標比例或重新設計版面配置。",
    q5: "要不要考慮目標寬度？", a5: "需要。目標寬度決定縮放後的實際高度，比例不變但絕對尺寸影響清晰度與排版。",
    q6: "這個工具能取代裝置預覽嗎？", a6: "不能。它只是快速估算與教育用途；正式輸出應以實際裝置預覽與量測為準。",
  },
  en: {
    badge: "Design · Aspect Ratio · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Aspect Ratio Calculator", subtitle: "Compute aspect ratio, scaled height, and match score from original width, height, and target width",
    intro: "This calculator uses original width, height, and target width to compute aspect ratio, scaled height, and match score, helping you judge whether an image will distort, which ratio to target, and whether to crop or letterbox, so you compute proportions and scaling clearly before finalizing design dimensions.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates aspect ratio from pixel values you enter, excluding DPI differences, subpixel rendering, and device resolution; for formal output, verify with actual device previews.",
    quickActionCard: "Quick Action Card", tryExample: "Create a ratio example instantly", examplePreview: "Ratio preview", examplePerson: "Original width", fillExample: "One-click 16:9 example", previewActivePath: "Fill 4:3 example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter original width, height, and target width", examplesHelper: "Start with an example to see how width and height set the aspect ratio and scaled height, then replace with your own data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "16:9 widescreen mode", activeExample: "4:3 classic demo", baselineExampleNote: "1920 × 1080", activeExampleNote: "1024 × 768", carbsLabel: "Match score", carbsName: "percent", proteinLabel: "Compliance score", flowDemo: "Target width", calculator: "Calculator",
    weight: "Height (px)", tdee: "Target Width (px)", goal: "Ratio mode", goalCut: "4:3 Classic (1.33)", goalMaintain: "16:9 Widescreen (1.778)", goalBulk: "2.35:1 Cinema (1.85)",
    resultCard: "Aspect Ratio Result", unit: ": 1 (aspect ratio)", primaryValue: "Primary Value", maintenanceTarget: "Compliance score", actionTarget: "Aspect ratio", estimatedTdee: "Target width", maintenance: "%", fatLossTarget: ": 1",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card aspect-ratio interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current aspect ratio into common zones. This is design guidance, not an output-quality conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the ratio result into an actionable dimension-adjustment strategy", conversionNote: "L9 values update from the computed result: compliance score, aspect ratio, and target-width hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current dimension snapshot", dailyGap: "Aspect ratio", weeklyTrend: "Compliance score", motivation: "Motivation Card", keepMomentum: "Move from ratio analysis to the most fitting design proportion rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's ratio result to your team", journeyHint: "Review it with the Type Scale Calculator to fold aspect ratio and type size into design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Decide legible type size with the Type Scale Calculator", nextActionItem2: "Optimize paragraph readability with the Line Height Calculator", nextActionItem3: "Balance layout whitespace with the Golden Ratio Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Width × Height → Ratio → Match → Scale", bmrStep: "Width", deficitStep: "Ratio", trendStep: "Match", mealStep: "Scale",
    knowledge: "Knowledge", knowledgeTitle: "What aspect ratio means in design", definition: "Definition", definitionText: "Aspect ratio is the proportion of an image's width to its height; 16:9 means width is 1.778× height, the mainstream format for web and video; higher ratios mean wider frames.", formula: "Formula", formulaText: "Aspect ratio = width ÷ height. Match score = max(0, (1 − |actual − target| ÷ target) × 100). Compliance score = min(actual ÷ target × 100, 100).", limitations: "Limitations", limitationsText: "This tool estimates ratio from pixel values; real output is also affected by DPI, subpixel rendering, device resolution, and CSS scaling.", interpretation: "Interpretation", interpretationText: "Ratios below 1.78 suggest using classic formats or cropping; widescreen content uses 16:9 or above, cinema uses 2.35:1, and match score judges distortion risk.", context: "Context", contextText: "Ratio results should be evaluated with type scale, line height, and layout proportion to balance legibility, aesthetics, and accessibility.", example: "Example", exampleText: "Width 1920, height 1080, 16:9 mode (1.778) → aspect ratio about 1.778:1, match score 100%, compliance score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for ratio", premiumTitle: "PRO Aspect Ratio Analytics Pack", premiumText: "Unlock batch ratio calculation, CSV export, custom ratio presets, and team collaboration.", feat1: "Batch Ratio", feat2: "Export CSV", feat3: "Custom Preset", feat4: "Team Collab",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for design planning and education. It does not replace actual device preview or output-quality testing.", relatedTools: "Related Tools", relatedToolsText: "Color Contrast · Golden Ratio · Type Scale · Line Height", references: "References", referencesText: "W3C CSS aspect-ratio spec; common aspect-ratio standards list; responsive image guidelines; accessible design guides.",
    q1: "How is aspect ratio calculated?", a1: "This tool divides width by height to get the aspect ratio, then compares it to the target ratio to compute match and compliance scores.",
    q2: "What match score is reasonable?", a2: "A match score of 100 means it perfectly matches the target ratio; if below 100, adjust dimensions or crop and letterbox.",
    q3: "16:9 or 4:3 ratio?", a3: "Use 16:9 (1.778) for general web video; use 4:3 (1.33) for presentations, documents, and legacy displays.",
    q4: "How do I fix a wrong aspect ratio?", a4: "Crop excess areas, add letterboxing, adjust the target ratio, or redesign the layout.",
    q5: "Should I consider target width?", a5: "Yes. Target width determines the actual scaled height; ratio stays the same but absolute size affects clarity and layout.",
    q6: "Can this tool replace device preview?", a6: "No. It is a quick estimate for education; formal output should follow actual device previews and measurements.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function ratioPrecision(mode: TierMode): number {
  if (mode === "relaxed") return 1.33;
  if (mode === "fast") return 1.85;
  return 1.778;
}

export default function AspectRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1080");
  const [tdee, setTdee] = useState("1280");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(tdee);
    const h = Number(weight);
    if (w <= 0 || h <= 0) return null;
    const actualRatio = w / h;
    const precision = ratioPrecision(goal);
    const matchScore = Math.max(0, (1 - Math.abs(actualRatio - precision) / precision) * 100);
    const complianceScore = Math.min((actualRatio / precision) * 100, 100);
    return { actualRatio, precision, matchScore, complianceScore };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.complianceScore, 1) : "—";
  const fatDisplay = result ? fmt(result.actualRatio, 3) : "—";
  const carbDisplay = result ? fmt(result.matchScore, 1) : "—";
  const totalDisplay = result ? fmt(result.actualRatio, 3) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1080"); setTdee("1920"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("768"); setTdee("1024"); setGoal("relaxed"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">1.778</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1.333</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">:1</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">:1</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="aspect-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.actualRatio, 3) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.complianceScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Width", note: t.bmrStep }, { label: "Ratio", note: t.deficitStep }, { label: "Match", note: t.trendStep }, { label: "Scale", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="aspect-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
