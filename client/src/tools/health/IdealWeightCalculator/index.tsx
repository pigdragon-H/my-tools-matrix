import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type WeightCategory = "low" | "ideal" | "high";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: WeightCategory;
  label: LocalText;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const categoryInfo: CategoryInfo[] = [
  {
    key: "low",
    label: { zh: "低於理想", en: "Below Ideal" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "當前體重低於理想體重範圍，可能需要增重或增肌。", en: "Current weight is below ideal range, may need to gain weight or muscle." },
    risks: { zh: "過低的體重可能與營養不足、肌肉量不足或代謝問題有關。", en: "Low weight may be related to insufficient nutrition, low muscle mass, or metabolic issues." },
    actions: { zh: "建議增加蛋白質攝入、進行阻力訓練、評估整體營養狀況。", en: "Increase protein intake, perform resistance training, assess overall nutrition." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
  },
  {
    key: "ideal",
    label: { zh: "理想範圍", en: "Ideal Range" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "當前體重在理想範圍內，反映健康的體重狀態。", en: "Current weight is within ideal range, reflecting a healthy weight status." },
    risks: { zh: "理想體重提供良好的健康基礎。維持規律運動和均衡飲食有助於長期健康。", en: "Ideal weight provides a good health foundation. Regular exercise and balanced diet support long-term health." },
    actions: { zh: "維持現有生活方式、規律運動、均衡營養、定期檢查。", en: "Maintain current lifestyle, regular exercise, balanced nutrition, periodic check-ups." },
    nextTool: { zh: "TDEE 計算機", en: "TDEE Calculator" },
  },
  {
    key: "high",
    label: { zh: "高於理想", en: "Above Ideal" },
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "當前體重高於理想體重範圍，可能需要減重。", en: "Current weight is above ideal range, may need to lose weight." },
    risks: { zh: "過高的體重可能增加代謝疾病、心血管疾病的風險。建議評估整體健康狀況。", en: "High weight may increase risk of metabolic and cardiovascular diseases. Assess overall health." },
    actions: { zh: "建議制定減重計畫、增加運動量、優化飲食、計算熱量赤字。", en: "Create a weight loss plan, increase exercise, optimize diet, calculate calorie deficit." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
];

const ui = {
  zh: {
    badge: "健康 · 體重管理 · Gold Tool",
    title: "理想體重計算機・健康體重指南",
    subtitle: "理想體重計算機引導體驗",
    intro: "根據身高計算理想體重範圍，快速了解您的健康體重目標，並延伸到 BMI、TDEE、熱量赤字等下一步工具。",
    trustNoteLabel: "信任提醒：",
    trustNote: "理想體重是基於 BMI 反推的估算值，不是絕對標準。實際健康體重因個人肌肉量、骨密度、年齡等因素而異。",
    quickActionCard: "快速範例卡",
    tryCommonHeightExample: "試用常見身高範例",
    weightPreview: "體重預覽",
    example: "範例",
    femaleExample: "女性",
    maleExample: "男性",
    height: "身高",
    weight: "體重",
    oneClickFillFemaleExample: "一鍵填入女性範例",
    previewMaleExample: "預覽男性決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的身高調整輸入而不失去脈絡。",
    exampleCards: "範例卡",
    malePathDemo: "男性路徑示範",
    oneClickFillAllowed: "160 cm · 可一鍵填入",
    malePathDescription: "180 cm · 展示理想體重 → BMI → TDEE 路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    heightCm: "身高（cm）",
    feet: "英尺",
    inches: "英寸",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    idealWeightRange: "理想體重範圍",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretWeightBeforeActing: "行動前先理解體重狀態",
    knowledge: "知識",
    idealWeightMeaning: "理想體重在健康宇宙中的意義",
    definition: "定義",
    definitionText: "理想體重是基於身高和 BMI 計算的健康體重範圍。理想體重 = 身高(m)² × 22，±10% 為安全範圍。",
    limitations: "限制",
    limitationsText: "理想體重無法考慮肌肉量、骨密度、年齡、性別等個人因素。實際健康體重因人而異。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "BMI、BMR、TDEE、熱量赤字、體脂率等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "理想體重 = 身高(m)² × 22；安全範圍 = 理想體重 ± 10%",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "理想體重是健康體重管理的參考標準，但不是唯一指標。建議結合 BMI、體脂率、肌肉量等多方面評估。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "WHO、CDC、MDCalc、NIH 體重管理指引。",
    recommendedProducts: "配合理想體重使用的健康工具",
  },
  en: {
    badge: "Health · Weight Management · Gold Tool",
    title: "Ideal Weight Calculator · Healthy Weight Guide",
    subtitle: "Ideal Weight Calculator guided experience",
    intro: "Calculate your ideal weight range based on height, quickly understand your healthy weight goals, and continue to BMI, TDEE, calorie deficit, and other next tools.",
    trustNoteLabel: "Trust note:",
    trustNote: "Ideal weight is an estimate based on BMI, not an absolute standard. Actual healthy weight varies by individual muscle mass, bone density, age, and other factors.",
    quickActionCard: "Quick Action Card",
    tryCommonHeightExample: "Try a common height example",
    weightPreview: "Weight preview",
    example: "Example",
    femaleExample: "Female",
    maleExample: "Male",
    height: "Height",
    weight: "Weight",
    oneClickFillFemaleExample: "One-click fill female example",
    previewMaleExample: "Preview male decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    exampleCards: "Example cards",
    malePathDemo: "Male path demo",
    oneClickFillAllowed: "160 cm · one-click fill allowed",
    malePathDescription: "180 cm · shows Ideal Weight → BMI → TDEE path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    heightCm: "Height (cm)",
    feet: "Feet",
    inches: "Inches",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    idealWeightRange: "Ideal Weight Range",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretWeightBeforeActing: "Interpret weight status before acting",
    knowledge: "Knowledge",
    idealWeightMeaning: "What Ideal Weight means in the Health universe",
    definition: "Definition",
    definitionText: "Ideal weight is a healthy weight range calculated based on height and BMI. Ideal Weight = Height(m)² × 22, ±10% is the safe range.",
    limitations: "Limitations",
    limitationsText: "Ideal weight cannot account for muscle mass, bone density, age, sex, and other individual factors. Actual healthy weight varies by person.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "BMI, BMR, TDEE, Calorie Deficit, Body Fat Rate, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "Ideal Weight = Height(m)² × 22; Safe Range = Ideal Weight ± 10%",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Ideal weight is a reference standard for healthy weight management, but not the only indicator. Consider combining BMI, body fat rate, muscle mass, and other factors for assessment.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "WHO, CDC, MDCalc, NIH Weight Management Guidelines.",
    recommendedProducts: "Health tools to use with ideal weight",
  },
} as const;

function getWeightCategory(current: number, ideal: number): WeightCategory {
  const ratio = current / ideal;
  if (ratio < 0.9) return "low";
  if (ratio > 1.1) return "high";
  return "ideal";
}

function formatWeight(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

export default function IdealWeightCalculator() {
  const { lang, setLang } = useLanguage();
  const [heightCm, setHeightCm] = useState("170");
  const [currentWeight, setCurrentWeight] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [currentWeightLb, setCurrentWeightLb] = useState("154");
  const [useMetric, setUseMetric] = useState(true);

  const t = ui[lang];

  const calculation = useMemo(() => {
    if (useMetric) {
      const hCm = Number(heightCm);
      const cw = Number(currentWeight);
      if (!hCm || !cw || hCm <= 0 || cw <= 0) return null;
      const hM = hCm / 100;
      const ideal = hM * hM * 22;
      const min = ideal * 0.9;
      const max = ideal * 1.1;
      const category = getWeightCategory(cw, ideal);
      return { ideal, min, max, current: cw, category };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const cw = Number(currentWeightLb);
    if (!totalInches || !cw || totalInches <= 0 || cw <= 0) return null;
    const hM = totalInches * 0.0254;
    const ideal = hM * hM * 22;
    const min = ideal * 0.9;
    const max = ideal * 1.1;
    const category = getWeightCategory(cw, ideal);
    return { ideal, min, max, current: cw, category };
  }, [heightCm, currentWeight, feet, inches, currentWeightLb, useMetric]);

  const activeCategory = calculation?.category ? categoryInfo.find((c) => c.key === calculation.category) : categoryInfo[1];
  const displayIdeal = calculation?.ideal ? formatWeight(calculation.ideal) : "—";
  const displayMin = calculation?.min ? formatWeight(calculation.min) : "—";
  const displayMax = calculation?.max ? formatWeight(calculation.max) : "—";

  function fillFemaleExample() {
    setUseMetric(true);
    setHeightCm("160");
    setCurrentWeight("60");
  }

  function fillMaleExample() {
    setUseMetric(true);
    setHeightCm("180");
    setCurrentWeight("80");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      {/* Hero Section */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
              aria-label={lang === "zh" ? "Switch to English" : "切換到中文"}
            >
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 EN</span>
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>

            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonHeightExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.weightPreview}</div>
                  <div className="text-3xl font-black">63 kg</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.femaleExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.height}</div><div className="mt-1 text-lg font-black">160 cm</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weight}</div><div className="mt-1 text-lg font-black">60 kg</div></div>
              </div>
              <button onClick={fillFemaleExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillFemaleExample}
              </button>
              <button onClick={fillMaleExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewMaleExample}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          {/* Calculator Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p>
                <h2 className="mt-2 text-3xl font-black">{t.enterOrFillValues}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${useMetric ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUseMetric(true)}>Metric</button>
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${!useMetric ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUseMetric(false)}>Imperial</button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillFemaleExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.femaleExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">160cm</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillMaleExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.maleExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.malePathDescription}</p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-4 grid gap-4">
                  {useMetric ? (
                    <>
                      <label className="block text-sm font-black text-slate-700">{t.heightCm}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} /></label>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-black text-slate-700">{t.feet}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feet} onChange={(e) => setFeet(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.inches}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inches} onChange={(e) => setInches(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentWeightLb} onChange={(e) => setCurrentWeightLb(e.target.value)} /></label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeCategory?.tone}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{displayIdeal}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeCategory?.label || categoryInfo[1].label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.idealWeightRange}</div>
                    <div className="mt-1 text-xl font-black">{displayMin} - {displayMax}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.idealWeightRange}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeCategory?.meaning || categoryInfo[1].meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeCategory?.actions || categoryInfo[1].actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeCategory?.nextTool || categoryInfo[1].nextTool, lang)}</p></div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretWeightBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categoryInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeCategory?.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <h3 className="font-black">{l(item.label, lang)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* AdSenseWrapper */}
          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          {/* Knowledge Section */}
          <section className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
              <h2 className="mt-2 text-3xl font-black">{t.idealWeightMeaning}</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-black">{t.definition}</h3>
                  <p className="mt-2 leading-6 text-slate-700">{t.definitionText}</p>
                </div>
                <div>
                  <h3 className="text-lg font-black">{t.formula}</h3>
                  <p className="mt-2 rounded-2xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">{t.formulaText}</p>
                </div>
                <div>
                  <h3 className="text-lg font-black">{t.limitations}</h3>
                  <p className="mt-2 leading-6 text-slate-700">{t.limitationsText}</p>
                </div>
                <div>
                  <h3 className="text-lg font-black">{t.semanticNeighbors}</h3>
                  <p className="mt-2 leading-6 text-slate-700">{t.semanticNeighborsText}</p>
                </div>
              </div>

              {/* AdSlot: Knowledge 中間 */}
              <div className="mt-6">
                <AdSlot slot="ideal-weight-knowledge" position="middle" />
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
              <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
              <div className="mt-5 space-y-3">
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-black">Q1: {lang === "zh" ? "理想體重和 BMI 有什麼區別？" : "What is the difference between ideal weight and BMI?"}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "理想體重是基於身高計算的具體重量範圍，BMI 是體重與身高的比例指數。理想體重更具體，BMI 更通用。" : "Ideal weight is a specific weight range calculated from height, BMI is a ratio index. Ideal weight is more specific, BMI is more universal."}</p>
                </details>
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-black">Q2: {lang === "zh" ? "理想體重範圍為什麼是 ±10%？" : "Why is the ideal weight range ±10%?"}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "±10% 的範圍考慮了個人肌肉量、骨密度、體型等差異，提供更現實的健康體重目標。" : "The ±10% range accounts for differences in muscle mass, bone density, body type, etc., providing more realistic healthy weight targets."}</p>
                </details>
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-black">Q3: {lang === "zh" ? "我應該達到理想體重嗎？" : "Should I aim for ideal weight?"}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "理想體重是參考標準，但不是絕對目標。建議結合 BMI、體脂率、肌肉量、整體健康狀況進行評估。" : "Ideal weight is a reference standard, not an absolute goal. Consider BMI, body fat rate, muscle mass, and overall health status."}</p>
                </details>
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-black">Q4: {lang === "zh" ? "如何達到理想體重？" : "How to achieve ideal weight?"}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "結合規律運動、均衡飲食、充足睡眠。根據需要計算 TDEE 和熱量赤字，制定科學的減重或增重計畫。" : "Combine regular exercise, balanced diet, adequate sleep. Calculate TDEE and calorie deficit as needed, create a scientific weight loss or gain plan."}</p>
                </details>
              </div>
            </article>
          </section>

          {/* AdSlot: FAQ 下方 */}
          <AdSlot slot="ideal-weight-faq" position="inline" />

          {/* SAVE/SHARE Section */}
          <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "健康旅程" : "Health Journey"}</p>
              <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "若理想體重偏高，繼續能量路徑" : "If Ideal Weight Is High, Continue Energy Path"}</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 1" : "Step 1"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "理想體重高" : "Ideal Weight High"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "篩選信號" : "Screening signal"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 2" : "Step 2"}</div>
                  <div>
                    <h3 className="font-black">BMI</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "身體質量指數" : "Body mass index"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 3" : "Step 3"}</div>
                  <div>
                    <h3 className="font-black">TDEE</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "每日熱量需求" : "Daily calorie needs"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "步驟 4" : "Step 4"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "熱量" : "Calories"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "計畫攝取" : "Plan intake"}</p>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "儲存 / 分享位置" : "Save / Share Placeholder"}</p>
              <h3 className="mt-2 text-xl font-black">{lang === "zh" ? "儲存結果或分享旅程" : "Save this result or share the journey"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "僅 UI 佔位符。不包含帳號、儲存、分享或匯出實現。" : "UI placeholder only. No account, storage, sharing, or export implementation is included in this prototype."}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800">{lang === "zh" ? "儲存" : "Save"}<br /><span className="text-xs font-normal">UI</span></button>
                <button className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-50">{lang === "zh" ? "分享" : "Share"}<br /><span className="text-xs font-normal">UI</span></button>
              </div>
            </article>
          </section>

          {/* Affiliate Layer */}
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { zh: "體重秤", en: "Scale", href: "#affiliate-scale" },
                { zh: "體脂計", en: "Body Fat Monitor", href: "#affiliate-bodyfat" },
                { zh: "測量尺", en: "Measuring Tape", href: "#affiliate-tape" },
                { zh: "健身計畫書", en: "Fitness Plans", href: "#affiliate-plans" },
              ].map((item) => (
                <a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">
                  {lang === "zh" ? item.zh : item.en}
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          {/* Premium Layer */}
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖完整健康追蹤" : "Unlock Complete Health Tracking"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          {/* References Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div>
                <h2 className="text-xl font-black">{t.trust}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p>
              </div>
              <div>
                <h2 className="text-xl font-black">{t.relatedTools}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">BMI · BMR · TDEE · {lang === "zh" ? "熱量赤字" : "Calorie Deficit"} · {lang === "zh" ? "體脂率" : "Body Fat Rate"}</p>
              </div>
              <div>
                <h2 className="text-xl font-black">{t.references}</h2>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  <li><a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">WHO</a></li>
                  <li><a href="https://www.cdc.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CDC</a></li>
                  <li><a href="https://www.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NIH</a></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sidebar with Premium Gate */}
      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="ideal-weight-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="ideal-weight-sidebar" position="bottom" />
      </div>

      {/* Footer Ad */}
      <AdSlot slot="ideal-weight-footer" position="footer" />
    </main>
  );
}
