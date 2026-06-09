// @profile B
// Profile B · Calculator-Design · ColorContrastRatioCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 1.5", label: { zh: "不合格", en: "Fail" }, desc: { zh: "對比度極低，文字幾乎無法辨識，所有情境皆不合格，需立即重選顏色。", en: "Very low contrast—text is barely legible, fails all cases; recolor immediately." } },
  { key: "low", range: "1.5–3", label: { zh: "偏低", en: "Low" }, desc: { zh: "對比度偏低，僅勉強適用大型裝飾文字，正文與小字皆不建議。", en: "Low contrast; only marginal for large decorative text, not for body or small text." } },
  { key: "healthy", range: "3–4.5", label: { zh: "AA 大字", en: "AA Large" }, desc: { zh: "通過 AA 大型文字標準，適合標題與大字級，但正文仍建議再提高。", en: "Passes AA large-text; good for headings and large sizes, but raise further for body." } },
  { key: "good", range: "4.5–7", label: { zh: "AA 標準", en: "AA Normal" }, desc: { zh: "通過 AA 正文標準，多數網頁正文的安全區間，可放心用於一般內文。", en: "Passes AA normal text; the safe band for most web body copy." } },
  { key: "strong", range: "7–12", label: { zh: "AAA 標準", en: "AAA" }, desc: { zh: "通過 AAA 最高無障礙標準，適合高可讀性需求與法規敏感場景。", en: "Passes AAA highest accessibility; ideal for high-legibility and compliance-sensitive cases." } },
  { key: "elite", range: "> 12", label: { zh: "極高對比", en: "Maximal" }, desc: { zh: "極高對比，辨識度最佳，但需留意純黑白可能造成的眩光與閱讀疲勞。", en: "Maximal contrast, best legibility—watch for glare and reading fatigue with pure black/white." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "黃金比例計算機", en: "Golden Ratio Calculator" }, href: "/tools/design/golden-ratio-calculator" },
  { label: { zh: "長寬比計算機", en: "Aspect Ratio Calculator" }, href: "/tools/design/aspect-ratio-calculator" },
  { label: { zh: "字級級數計算機", en: "Type Scale Calculator" }, href: "/tools/design/type-scale-calculator" },
  { label: { zh: "行高計算機", en: "Line Height Calculator" }, href: "/tools/design/line-height-calculator" },
];

const ui = {
  zh: {
    badge: "Design · 色彩對比 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "色彩對比度計算機 · Contrast Ratio", subtitle: "用前景亮度、背景亮度與 WCAG 等級算出對比度、達標餘量與合規分數",
    intro: "Color Contrast Ratio Calculator 依據前景亮度、背景亮度與目標 WCAG 等級（AA 大字、AA 標準或 AAA），計算對比度、達標餘量與合規分數，協助您判斷文字與背景是否清晰可讀、該選哪個無障礙等級、是否需要加深或調亮顏色，讓您在決定設計配色前就把可讀性與無障礙合規算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的相對亮度估算對比度，未含子像素渲染、字重與環境光差異；正式無障礙稽核請以實際 WCAG 工具與螢幕量測為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立對比範例", examplePreview: "對比預覽", examplePerson: "前景亮度", fillExample: "一鍵填入 AA 標準範例", previewActivePath: "填入 AAA 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入前景亮度、背景亮度與 WCAG 等級", examplesHelper: "先用範例理解亮度差如何決定對比度與達標餘量，再改成自己的配色數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "AA 標準模式", activeExample: "AAA 示範", baselineExampleNote: "前景 90 · 背景 10 · AA", activeExampleNote: "前景 90 · 背景 10 · AAA", carbsLabel: "達標餘量", carbsName: "百分比", proteinLabel: "合規分數", flowDemo: "背景亮度", calculator: "計算機",
    weight: "前景亮度 (0-100)", tdee: "背景亮度 (0-100)", goal: "WCAG 等級", goalCut: "AA 大字 (3.0)", goalMaintain: "AA 標準 (4.5)", goalBulk: "AAA (7.0)",
    resultCard: "對比度結果", unit: ": 1 (對比度)", primaryValue: "主要數值", maintenanceTarget: "合規分數", actionTarget: "對比度", estimatedTdee: "背景亮度", maintenance: "%", fatLossTarget: ": 1",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格對比度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前對比度放進常見區間；這是設計參考，不是無障礙稽核結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把對比結果轉成可執行的配色調整策略", conversionNote: "L9 會連動目前計算結果，顯示合規分數、對比度與背景亮度提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前配色概況", dailyGap: "對比度", weeklyTrend: "合規分數", motivation: "動力卡", keepMomentum: "從對比分析走向最清晰可讀的配色節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的對比結果帶回團隊", journeyHint: "用字級級數計算機一起看，把對比度與字級大小一併納入無障礙設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用字級級數計算機決定可讀字級", nextActionItem2: "用行高計算機優化段落易讀性", nextActionItem3: "用黃金比例計算機平衡版面留白",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Foreground → 合規分數 → 等級 → 背景", bmrStep: "Foreground", deficitStep: "合規分數", trendStep: "等級", mealStep: "背景",
    knowledge: "知識", knowledgeTitle: "對比度在無障礙設計中的意義", definition: "定義", definitionText: "色彩對比度是把較亮色與較暗色的相對亮度加上偏移後相除得到的比值；WCAG 以此比值定義無障礙等級，對比度越高代表文字與背景越易辨識，是無障礙設計的核心指標。", formula: "公式", formulaText: "對比度 = (亮色亮度 + 0.05) ÷ (暗色亮度 + 0.05)。達標餘量 = (對比度 − 門檻) ÷ 門檻 × 100%。合規分數 = min(對比度 ÷ 門檻 × 100, 100)。", limitations: "限制", limitationsText: "本工具以簡化相對亮度估算；真實對比還受 sRGB gamma 轉換、字重、字級、子像素渲染、抗鋸齒與環境光影響，且彩色文字需以實際亮度公式計算。", interpretation: "解讀", interpretationText: "對比度低於 4.5 的正文建議加深前景或調亮背景；標題可用 3.0 以上，AAA 場景需達 7.0，並用達標餘量判斷安全空間。", context: "脈絡", contextText: "對比結果應與字級級數、行高與版面比例一起看，才能在可讀性、美感與無障礙之間取得平衡。", example: "範例", exampleText: "前景亮度 90、背景亮度 10、AA 標準（4.5）→ 對比度約 6.3:1，達標餘量約 40%，合規分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "對比的下一步工具", premiumTitle: "PRO 色彩對比分析包", premiumText: "解鎖 sRGB 精確亮度換算、HEX 取色、AA/AAA 雙等級檢測與多配色對比比較矩陣。", feat1: "sRGB亮度", feat2: "十六進位選色", feat3: "雙級判定", feat4: "調色矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供設計規劃與教育用途，不取代正式 WCAG 無障礙稽核、螢幕量測或法規合規報告。", relatedTools: "相關工具", relatedToolsText: "Golden Ratio · Aspect Ratio · Type Scale · Line Height", references: "參考資料", referencesText: "WCAG 2.1 對比度準則；相對亮度公式規範；sRGB 色彩空間標準；無障礙設計指南。",
    q1: "對比度怎麼算的？", a1: "本工具以亮色亮度加偏移除以暗色亮度加偏移得對比比值；真實計算需先做 sRGB gamma 轉換得相對亮度。",
    q2: "合規分數多少才合理？", a2: "合規分數達 100 代表已通過所選 WCAG 等級；若低於 100，建議加深前景、調亮背景或改用更高對比配色。",
    q3: "AA 還是 AAA 等級？", a3: "一般網頁正文用 AA（4.5）即可；高可讀性需求、法規敏感或長者導向產品建議用 AAA（7.0）。",
    q4: "對比度太低怎麼提升？", a4: "加深前景文字、調亮背景、增加亮度差、避免低飽和近似色，並用字級加大與字重加粗輔助辨識。",
    q5: "要不要考慮字級大小？", a5: "需要。大型文字（18pt 或粗體 14pt 以上）門檻可降到 3.0；正文與小字則需達 4.5 以上。",
    q6: "這個工具能取代 WCAG 稽核嗎？", a6: "不能。它只是快速估算與教育用途；正式無障礙合規應以實際 WCAG 工具與螢幕量測為準。",
  },
  en: {
    badge: "Design · Color Contrast · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Color Contrast Ratio Calculator", subtitle: "Compute contrast ratio, pass margin, and compliance score from foreground luminance, background luminance, and WCAG level",
    intro: "This calculator uses foreground luminance, background luminance, and target WCAG level (AA large, AA normal, or AAA) to compute contrast ratio, pass margin, and compliance score, helping you judge whether text and background are clearly legible, which accessibility level to target, and whether to darken or lighten colors, so you compute legibility and accessibility compliance clearly before finalizing a design palette.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates contrast from the relative luminance you enter, excluding subpixel rendering, font weight, and ambient-light differences; for formal accessibility audits, follow actual WCAG tools and screen measurement.",
    quickActionCard: "Quick Action Card", tryExample: "Create a contrast example instantly", examplePreview: "Contrast preview", examplePerson: "Foreground luminance", fillExample: "One-click AA normal example", previewActivePath: "Fill AAA example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter foreground luminance, background luminance, and WCAG level", examplesHelper: "Start with an example to see how luminance difference sets the contrast ratio and pass margin, then replace with your own palette data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "AA normal mode", activeExample: "AAA demo", baselineExampleNote: "fg 90 · bg 10 · AA", activeExampleNote: "fg 90 · bg 10 · AAA", carbsLabel: "Pass margin", carbsName: "percent", proteinLabel: "Compliance score", flowDemo: "Background luminance", calculator: "Calculator",
    weight: "Foreground luminance (0-100)", tdee: "Background luminance (0-100)", goal: "WCAG level", goalCut: "AA large (3.0)", goalMaintain: "AA normal (4.5)", goalBulk: "AAA (7.0)",
    resultCard: "Contrast Ratio Result", unit: ": 1 (contrast ratio)", primaryValue: "Primary Value", maintenanceTarget: "Compliance score", actionTarget: "Contrast ratio", estimatedTdee: "Background luminance", maintenance: "%", fatLossTarget: ": 1",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card contrast-ratio interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current contrast ratio into common zones. This is design guidance, not an accessibility-audit conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the contrast result into an actionable palette-adjustment strategy", conversionNote: "L9 values update from the computed result: compliance score, contrast ratio, and background-luminance hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current palette snapshot", dailyGap: "Contrast ratio", weeklyTrend: "Compliance score", motivation: "Motivation Card", keepMomentum: "Move from contrast analysis to the most legible palette rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's contrast result to your team", journeyHint: "Review it with the Type Scale Calculator to fold contrast ratio and type size into accessible design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Decide legible type size with the Type Scale Calculator", nextActionItem2: "Optimize paragraph readability with the Line Height Calculator", nextActionItem3: "Balance layout whitespace with the Golden Ratio Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Foreground → Compliance → Level → Background", bmrStep: "Foreground", deficitStep: "Compliance", trendStep: "Level", mealStep: "Background",
    knowledge: "Knowledge", knowledgeTitle: "What contrast ratio means in accessible design", definition: "Definition", definitionText: "Color contrast ratio divides the lighter color's relative luminance plus offset by the darker color's, plus offset; WCAG defines accessibility levels by this ratio, and higher contrast means text and background are more legible, the core indicator of accessible design.", formula: "Formula", formulaText: "Contrast = (lighter luminance + 0.05) ÷ (darker luminance + 0.05). Pass margin = (contrast − threshold) ÷ threshold × 100%. Compliance score = min(contrast ÷ threshold × 100, 100).", limitations: "Limitations", limitationsText: "This tool uses simplified relative luminance; real contrast is also affected by sRGB gamma conversion, font weight, type size, subpixel rendering, antialiasing, and ambient light, and colored text needs the actual luminance formula.", interpretation: "Interpretation", interpretationText: "Body text below 4.5 should darken the foreground or lighten the background; headings can use 3.0 or above, AAA cases need 7.0, and use the pass margin to judge safety room.", context: "Context", contextText: "Contrast results should be evaluated with type scale, line height, and layout ratio to balance legibility, aesthetics, and accessibility.", example: "Example", exampleText: "Foreground luminance 90, background 10, AA normal (4.5) → contrast about 6.3:1, pass margin about 40%, compliance score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for contrast", premiumTitle: "PRO Color Contrast Analytics Pack", premiumText: "Unlock precise sRGB luminance conversion, HEX color picking, dual AA/AAA detection, and a multi-palette contrast comparison matrix.", feat1: "sRGB Luminance", feat2: "Hex Picker", feat3: "Dual Level", feat4: "Palette Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for design planning and education. It does not replace a formal WCAG accessibility audit, screen measurement, or compliance report.", relatedTools: "Related Tools", relatedToolsText: "Golden Ratio · Aspect Ratio · Type Scale · Line Height", references: "References", referencesText: "WCAG 2.1 contrast guidelines; relative luminance formula spec; sRGB color space standard; accessible design guides.",
    q1: "How is contrast ratio calculated?", a1: "This tool divides the lighter luminance plus offset by the darker luminance plus offset; real calculation first applies sRGB gamma conversion for relative luminance.",
    q2: "What compliance score is reasonable?", a2: "A compliance score of 100 means it passes the chosen WCAG level; if below 100, darken the foreground, lighten the background, or use a higher-contrast palette.",
    q3: "AA or AAA level?", a3: "Use AA (4.5) for general web body text; use AAA (7.0) for high-legibility needs, compliance-sensitive, or senior-oriented products.",
    q4: "How do I raise a low contrast?", a4: "Darken the foreground text, lighten the background, increase luminance difference, avoid low-saturation similar colors, and aid legibility with larger size and bolder weight.",
    q5: "Should I consider type size?", a5: "Yes. Large text (18pt or bold 14pt and above) can drop the threshold to 3.0; body and small text need 4.5 or above.",
    q6: "Can this tool replace a WCAG audit?", a6: "No. It is a quick estimate for education; formal accessibility compliance should follow actual WCAG tools and screen measurement.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetThreshold(mode: TierMode): number {
  if (mode === "relaxed") return 3.0;
  if (mode === "fast") return 7.0;
  return 4.5;
}

export default function ColorContrastRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("90");
  const [tdee, setTdee] = useState("10");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const fg = Number(weight) / 100;
    const bg = Number(tdee) / 100;
    if (Number(weight) < 0 || Number(tdee) < 0) return null;
    const lighter = Math.max(fg, bg);
    const darker = Math.min(fg, bg);
    const contrast = (lighter + 0.05) / (darker + 0.05);
    const threshold = targetThreshold(goal);
    const passMargin = ((contrast - threshold) / threshold) * 100;
    const complianceScore = Math.min((contrast / threshold) * 100, 100);
    return { contrast, threshold, passMargin, complianceScore };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.complianceScore, 1) : "—";
  const fatDisplay = result ? fmt(result.contrast, 2) : "—";
  const carbDisplay = result ? fmt(result.passMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.contrast, 2) : "—";

  function fillStandard() { setUnit("metric"); setWeight("90"); setTdee("10"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("90"); setTdee("10"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">6.33</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">6.33</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">:1</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">:1</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="color-contrast-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.contrast, 2) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.complianceScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Foreground", note: t.bmrStep }, { label: "Compliance", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Background", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="color-contrast-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
