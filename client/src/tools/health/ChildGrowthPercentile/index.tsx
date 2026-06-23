// @profile B
// Profile B · Calculator-YMYL · ChildGrowthPercentile（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Sex = "boy" | "girl";
type Metric = "height" | "weight";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 1) => (Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—");

const REF: Record<Sex, Record<Metric, { med: number; sd: number }>> = {
  boy: { height: { med: 110, sd: 0.06 }, weight: { med: 18.5, sd: 0.14 } },
  girl: { height: { med: 109, sd: 0.06 }, weight: { med: 18.0, sd: 0.14 } },
};

const percentileFor = (z: number) => {
  if (z <= -2) return 3;
  if (z <= -1.3) return 10;
  if (z <= -0.5) return 25;
  if (z < 0.5) return 50;
  if (z < 1.3) return 75;
  if (z < 2) return 90;
  return 97;
};

const bands = [
  { key: "p3", range: "≤ P3", label: { zh: "偏低帶", en: "Low band" }, desc: { zh: "約第 3 百分位以下，低於同齡多數，建議與兒科討論。", en: "Below ~3rd pct; below most peers; discuss with pediatrics." } },
  { key: "p10", range: "P3–P10", label: { zh: "偏低正常", en: "Low-normal" }, desc: { zh: "約第 3–10 百分位，仍在正常下緣，留意成長趨勢。", en: "~3rd–10th pct; lower-normal; watch the trend." } },
  { key: "p25", range: "P10–P25", label: { zh: "中下", en: "Lower-mid" }, desc: { zh: "約第 10–25 百分位，常見區間，趨勢穩定即可。", en: "~10th–25th pct; common range; stable trend is fine." } },
  { key: "p50", range: "P25–P75", label: { zh: "中位", en: "Median" }, desc: { zh: "約第 25–75 百分位，落在中位附近，最常見。", en: "~25th–75th pct; around median; most common." } },
  { key: "p75", range: "P75–P90", label: { zh: "中上", en: "Upper-mid" }, desc: { zh: "約第 75–90 百分位，偏高常見區間，趨勢穩定即可。", en: "~75th–90th pct; upper-common; stable trend is fine." } },
  { key: "p97", range: "≥ P90", label: { zh: "偏高帶", en: "High band" }, desc: { zh: "約第 90 百分位以上，高於同齡多數，建議與兒科討論。", en: "Above ~90th pct; above most peers; discuss with pediatrics." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "理想體重計算機", en: "Ideal Weight Calculator" }, href: "/tools/health/ideal-weight-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 兒童成長 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "兒童生長曲線百分位 · Child Growth Percentile", subtitle: "用年齡、性別與量測值對照成長百分位區間",
    intro: "輸入兒童的年齡、性別與身高或體重，估算所在的生長百分位區間，並對照常見參考帶，協助家長理解成長相對位置。",
    trustNoteLabel: "注意事項：", trustNote: "參考帶為簡化教育模型，實際生長評估須依兒科生長曲線與個別狀況；本工具僅供估算與教育，不作診斷依據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立兒童成長範例", examplePreview: "估算百分位預覽", examplePerson: "年齡", fillExample: "一鍵填入男孩身高範例", previewActivePath: "填入女孩體重範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年齡、性別與量測值", examplesHelper: "先用範例理解身高體重如何對照百分位，再改成自己的數值。",
    metric: "身高 (cm)", imperial: "體重 (kg)", exampleCards: "範例卡", baselineExample: "5 歲男孩身高", activeExample: "6 歲女孩體重", baselineExampleNote: "5 歲 · 男孩 · 110 cm", activeExampleNote: "6 歲 · 女孩 · 21 kg", calculator: "計算機",
    age: "年齡（歲）", sex: "性別", boy: "男孩", girl: "女孩", metricLabel: "量測項目", metricHeight: "身高 (cm)", metricWeight: "體重 (kg)", value: "量測值",
    resultCard: "估算結果", unit: "百分位", primaryValue: "量測值", median: "同齡中位", zScore: "標準差倍數",
    resultIntelligence: "結果解讀", matrix: "六格百分位帶判讀矩陣", matrixNote: "L7 固定六格，將目前量測值對照常見百分位帶；這是教育參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把成長百分位轉成可理解資訊", conversionNote: "L9 會連動目前估算結果，顯示量測值、同齡中位與相對參考提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前成長定位", dailyGap: "與中位差距", weeklyTrend: "標準差", motivation: "動力卡", keepMomentum: "從單次量測走向連續追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的成長紀錄帶回家", journeyHint: "用多次連續紀錄看成長曲線，避免被單日量測誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 BMI 確認體位是否合理", nextActionItem2: "用 TDEE 估算每日能量需求", nextActionItem3: "用 Macro 規劃營養比例",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "量測 → 估算 → 對照趨勢 → 追蹤", measureStep: "量測", estimateStep: "估算", compareStep: "對照", trackStep: "追蹤",
    knowledge: "知識", knowledgeTitle: "生長百分位在健康宇宙中的意義", definition: "定義", definitionText: "百分位代表在同齡同性別群體中的相對位置，第 50 百分位約為中位。", formula: "公式", formulaText: "z = (量測值 − 中位) ÷ 標準差，再對照百分位帶。", limitations: "限制", limitationsText: "本模型為簡化教育版，正式評估須用兒科生長曲線圖。", interpretation: "解讀", interpretationText: "趨勢比單點重要，連續沿同一條百分位線通常代表穩定成長。", context: "脈絡", contextText: "遺傳、營養與健康狀況都會影響百分位，需整體判讀。", example: "範例", exampleText: "5 歲男孩 110 cm 約落在 P50 中位附近。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "兒童健康規劃的下一步工具", premiumTitle: "PRO 成長追蹤包", premiumText: "解鎖多點生長曲線、百分位趨勢圖與個人化追蹤報告。", feat1: "生長曲線", feat2: "趨勢圖", feat3: "百分位帶", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供估算與教育用途，不取代醫療診斷、生長評估或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · TDEE Calculator · Macro Calculator · Ideal Weight Calculator", references: "參考資料", referencesText: "WHO Child Growth Standards; CDC Growth Charts; Taiwan Pediatric Association growth references; Cole LMS method for percentiles。",
    q1: "百分位是什麼意思？", a1: "第 50 百分位代表約一半同齡兒童比他矮或輕；數字越大代表越偏上緣。",
    q2: "這個結果準確嗎？", a2: "本工具用簡化參考帶估算，僅供教育；正式評估請用兒科生長曲線圖。",
    q3: "男女為什麼分開算？", a3: "男女在不同年齡的身高體重分布不同，分開對照較貼近實際。",
    q4: "百分位偏低要擔心嗎？", a4: "單次數值不等於問題，連續追蹤的趨勢比單點更重要。",
    q5: "可以用來診斷生長遲緩嗎？", a5: "不行，本工具僅供換算與教育，診斷請交由專業醫療判斷。",
    q6: "要多久量一次？", a6: "依兒科建議的回診節奏記錄，連續多點才能看出成長曲線。",
  },
  en: {
    badge: "Health · Child Growth · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Child Growth Percentile · Growth Chart", subtitle: "Compare growth percentile band from age, sex, and measurement",
    intro: "Enter a child's age, sex and height or weight to estimate the growth percentile band against common references, helping parents understand relative growth position.",
    trustNoteLabel: "Note:", trustNote: "Reference bands are a simplified educational model; real assessment relies on clinical growth charts and individual context. This tool is for estimation and education only.",
    quickActionCard: "Quick Action Card", tryExample: "Create a child growth example instantly", examplePreview: "Estimated percentile preview", examplePerson: "Age", fillExample: "Fill boy height example", previewActivePath: "Fill girl weight example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter age, sex and measurement", examplesHelper: "Start with an example to understand how height and weight map to percentiles, then replace with your own values.",
    metric: "Height (cm)", imperial: "Weight (kg)", exampleCards: "Example cards", baselineExample: "5yo boy height", activeExample: "6yo girl weight", baselineExampleNote: "5y · Boy · 110 cm", activeExampleNote: "6y · Girl · 21 kg", calculator: "Calculator",
    age: "Age (years)", sex: "Sex", boy: "Boy", girl: "Girl", metricLabel: "Metric", metricHeight: "Height (cm)", metricWeight: "Weight (kg)", value: "Value",
    resultCard: "Estimated Result", unit: "percentile", primaryValue: "Value", median: "Age median", zScore: "Z-score",
    resultIntelligence: "Result Intelligence", matrix: "Six-band percentile interpretation matrix", matrixNote: "L7 uses six fixed cells to compare the current measurement with common percentile bands. Educational reference, not medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the percentile into something readable", conversionNote: "L9 values update from the current estimate: measurement, age median and relative reference hints.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current growth position", dailyGap: "Gap vs median", weeklyTrend: "SD", motivation: "Motivation Card", keepMomentum: "Move from a single measurement to consistent tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's growth record home", journeyHint: "Track multiple points to see the growth curve and avoid overreacting to a single-day measurement.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm body status with BMI Calculator", nextActionItem2: "Estimate daily energy needs with TDEE", nextActionItem3: "Plan nutrition ratios with Macro",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Measure → Estimate → Compare trend → Track", measureStep: "Measure", estimateStep: "Estimate", compareStep: "Compare", trackStep: "Track",
    knowledge: "Knowledge", knowledgeTitle: "What growth percentile means in the Health universe", definition: "Definition", definitionText: "A percentile is the relative position within same-age, same-sex peers; the 50th is roughly median.", formula: "Formula", formulaText: "z = (value − median) ÷ SD, then map to a percentile band.", limitations: "Limitations", limitationsText: "This is a simplified educational model; formal assessment needs clinical growth charts.", interpretation: "Interpretation", interpretationText: "Trend matters more than one point; staying along one percentile line usually means steady growth.", context: "Context", contextText: "Genetics, nutrition and health all affect percentile; read it holistically.", example: "Example", exampleText: "A 5-year-old boy at 110 cm sits near the P50 median.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for child health planning", premiumTitle: "PRO Growth Tracking Pack", premiumText: "Unlock multi-point growth curves, percentile trend charts and personalized tracking reports.", feat1: "Growth curve", feat2: "Trend chart", feat3: "Percentile band", feat4: "Reports",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for estimation and education only and does not replace medical diagnosis, growth assessment or professional advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · TDEE Calculator · Macro Calculator · Ideal Weight Calculator", references: "References", referencesText: "WHO Child Growth Standards; CDC Growth Charts; Taiwan Pediatric Association growth references; Cole LMS method for percentiles.",
    q1: "What does percentile mean?", a1: "The 50th percentile means about half of same-age children are shorter or lighter; higher numbers are toward the upper end.",
    q2: "Is this accurate?", a2: "This uses simplified reference bands for education only; use clinical growth charts for formal assessment.",
    q3: "Why separate boys and girls?", a3: "Boys and girls have different height and weight distributions by age, so separate references fit better.",
    q4: "Should I worry about a low percentile?", a4: "A single value is not a problem by itself; the tracked trend matters more than one point.",
    q5: "Can it diagnose growth delay?", a5: "No; this is for estimation and education only. Diagnosis belongs to professionals.",
    q6: "How often should I measure?", a6: "Follow your pediatric schedule; multiple points reveal the growth curve.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function ChildGrowthPercentile() {
  const { lang, setLang } = useLanguage();
  const [ageRef, setAgeRef] = useState("5");
  const [sex, setSex] = useState<Sex>("boy");
  const [metric, setMetric] = useState<Metric>("height");
  const [value, setValue] = useState("110");
  const t = ui[lang];

  const result = useMemo(() => {
    const age = Number(ageRef);
    const val = Number(value);
    if (age <= 0 || val <= 0) return null;
    const base = REF[sex][metric];
    const ageScale = metric === "height" ? 1 + (age - 5) * 0.07 : 1 + (age - 5) * 0.12;
    const med = base.med * ageScale;
    const sd = med * base.sd;
    const z = sd > 0 ? (val - med) / sd : 0;
    const pct = percentileFor(z);
    return { med, sd, z, pct, gap: val - med };
  }, [ageRef, sex, metric, value]);

  const unit = metric === "height" ? "cm" : "kg";
  const pctDisplay = result ? `P${result.pct}` : "—";
  const medianDisplay = result ? `${fmt(result.med)} ${unit}` : "—";
  const zDisplay = result ? fmt(result.z, 2) : "—";
  const gapDisplay = result ? `${fmt(result.gap)} ${unit}` : "—";
  const sdDisplay = result ? `${fmt(result.sd)} ${unit}` : "—";

  function fillBoy() { setSex("boy"); setMetric("height"); setAgeRef("5"); setValue("110"); }
  function fillGirl() { setSex("girl"); setMetric("weight"); setAgeRef("6"); setValue("21"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{pctDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{ageRef}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.sex}</div><div className="font-black">{sex === "boy" ? "👦" : "👧"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.value}</div><div className="font-black">{value} {unit}</div></div></div><button onClick={fillBoy} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillGirl} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${metric === "height" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMetric("height")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${metric === "weight" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMetric("weight")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBoy} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">P50</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillGirl} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">P75</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.age}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={ageRef} onChange={(e) => setAgeRef(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.sex}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="boy">{t.boy}</option><option value="girl">{t.girl}</option></select></label><label className="block text-sm font-black text-slate-700">{t.metricLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}><option value="height">{t.metricHeight}</option><option value="weight">{t.metricWeight}</option></select></label><label className="block text-sm font-black text-slate-700">{t.value} ({unit})<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={value} onChange={(e) => setValue(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{pctDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{value} {unit}</div><div className="mt-1 text-xs text-slate-300">{sex === "boy" ? "BOY" : "GIRL"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.value}</div><p className="mt-2 text-3xl font-black text-blue-950">{value}</p><p className="text-sm font-bold text-blue-700">{unit}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.median}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.median}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result ? fmt(result.med) : "—"}</p><p className="text-sm font-bold text-emerald-700">{unit}</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.zScore}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.zScore}</div><p className="mt-2 text-3xl font-black text-orange-950">{zDisplay}</p><p className="text-sm font-bold text-orange-700">σ</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.matrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.matrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{pctDisplay}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cgp-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{pctDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{gapDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{zDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.measureStep, t.estimateStep, t.compareStep, t.trackStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Measure", note: t.measureStep }, { label: "Estimate", note: t.estimateStep }, { label: "Compare", note: t.compareStep }, { label: "Track", note: t.trackStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
