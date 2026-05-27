import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type IdealWeightCategory = "underweight" | "normal" | "overweight";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: IdealWeightCategory;
  label: LocalText;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
  tools: LocalText[];
};

const l = (value: LocalText, lang: Lang) => value[lang];

const categoryInfo: CategoryInfo[] = [
  {
    key: "underweight",
    label: { zh: "低於理想體重", en: "Below Ideal Weight" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "當前體重低於計算的理想體重範圍。", en: "Current weight is below the calculated ideal weight range." },
    risks: { zh: "可能與營養不足、代謝問題或健康狀況有關。建議檢視飲食與整體健康狀況。", en: "May be associated with undernutrition, metabolic issues, or health conditions. Review nutrition and overall health." },
    actions: { zh: "檢視飲食營養、能量攝入和整體健康狀況。若持續偏低，請尋求專業指導。", en: "Review nutrition, energy intake, and overall health. Seek professional guidance if persistent." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
    tools: [{ zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "BMI 計算機", en: "BMI Calculator" }],
  },
  {
    key: "normal",
    label: { zh: "理想體重範圍", en: "Ideal Weight Range" },
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "當前體重在計算的理想體重範圍內。", en: "Current weight is within the calculated ideal weight range." },
    risks: { zh: "通常表示體重與身高的比例較為健康。但應結合 BMI、體脂率等指標進行全面評估。", en: "Generally indicates a healthy weight-to-height ratio. Combine with BMI and body composition metrics for comprehensive assessment." },
    actions: { zh: "維持均衡營養、規律運動、充足睡眠。定期評估健康指標。", en: "Maintain balanced nutrition, regular exercise, adequate sleep. Regularly assess health metrics." },
    nextTool: { zh: "BMI 計算機", en: "BMI Calculator" },
    tools: [{ zh: "BMI 計算機", en: "BMI Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "BMR 計算機", en: "BMR Calculator" }],
  },
  {
    key: "overweight",
    label: { zh: "高於理想體重", en: "Above Ideal Weight" },
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "當前體重高於計算的理想體重範圍。", en: "Current weight is above the calculated ideal weight range." },
    risks: { zh: "可能與較高的代謝風險相關。但需結合 BMI、體脂率等指標進行全面評估。", en: "May be associated with higher metabolic risk. Assess with BMI and body composition metrics." },
    actions: { zh: "建議先計算 BMI、TDEE、體脂率，了解完整健康狀況後再制定體重管理計劃。", en: "Calculate BMI, TDEE, and body fat percentage to understand your complete health profile before planning weight management." },
    nextTool: { zh: "BMI 計算機", en: "BMI Calculator" },
    tools: [{ zh: "BMI 計算機", en: "BMI Calculator" }, { zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }],
  },
];

const ui = {
  zh: {
    badge: "健康 · 生物指標 · Gold Tool",
    title: "理想體重計算機・健康體重指南",
    subtitle: "理想體重計算機引導體驗",
    intro: "根據身高計算理想體重範圍，快速了解您的健康體重目標，並延伸到 BMI、BMR、TDEE 等下一步工具。",
    trustNoteLabel: "信任提醒：",
    trustNote: "理想體重是參考指標，不是診斷。它無法區分肌肉和脂肪、考慮運動員體組成、懷孕情境或兒童百分位狀態。",
    quickActionCard: "快速範例卡",
    tryCommonHeightExample: "試用常見身高範例",
    idealWeightPreview: "理想體重預覽",
    example: "範例",
    femaleHeight: "女性身高",
    maleHeight: "男性身高",
    weight: "體重",
    height: "身高",
    oneClickFillFemaleExample: "一鍵填入女性範例",
    previewHighWeightPath: "預覽高體重決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    highWeightPathDemo: "高體重路徑示範",
    oneClickFillAllowed: "160cm · 可一鍵填入",
    highWeightPathDescription: "180cm · 展示 BMI → BMR → TDEE 路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    heightCm: "身高（cm）",
    currentWeightKg: "當前體重（kg）",
    feet: "英尺",
    inches: "英寸",
    currentWeightLb: "當前體重（lb）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    weightRange: "體重範圍",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretCategoryBeforeActing: "行動前先理解分類",
    knowledge: "知識",
    idealWeightMeaning: "理想體重在健康宇宙中的意義",
    definition: "定義",
    definitionText: "理想體重是根據身高計算出的健康體重範圍。本計算器採用 BMI 反推法，以 BMI 22 為中心值。",
    limitations: "限制",
    limitationsText: "理想體重無法區分肌肉和脂肪、考慮體脂分佈、懷孕狀態或兒童百分位狀態。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "BMI、BMR、TDEE、體脂率、腰圍比例等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "理想體重 = 身高(m) × 身高(m) × 22，理想體重範圍 = 中位數 ± 10%",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "參考資料應包含 WHO、CDC 與 NIH。理想體重是參考指標，不是診斷或醫療治療建議。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "WHO 分類脈絡、CDC BMI 篩查指引，以及 NIH 健康風險脈絡。",
  },
  en: {
    badge: "Health · Biometrics · Gold Tool",
    title: "Ideal Weight Calculator · Healthy Weight Guide",
    subtitle: "Ideal Weight Calculator guided experience",
    intro: "Calculate your ideal weight range based on height, quickly understand your healthy weight goals, and continue to BMI, BMR, TDEE, and other next tools.",
    trustNoteLabel: "Trust note:",
    trustNote: "Ideal weight is a reference metric, not a diagnosis. It cannot distinguish muscle from fat, consider athletic body composition, pregnancy context, or child percentile status.",
    quickActionCard: "Quick Action Card",
    tryCommonHeightExample: "Try a common height example",
    idealWeightPreview: "Ideal weight preview",
    example: "Example",
    femaleHeight: "Female height",
    maleHeight: "Male height",
    weight: "Weight",
    height: "Height",
    oneClickFillFemaleExample: "One-click fill female example",
    previewHighWeightPath: "Preview high weight decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    highWeightPathDemo: "High weight path demo",
    oneClickFillAllowed: "160cm · one-click fill allowed",
    highWeightPathDescription: "180cm · shows BMI → BMR → TDEE path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    heightCm: "Height (cm)",
    currentWeightKg: "Current Weight (kg)",
    feet: "Feet",
    inches: "Inches",
    currentWeightLb: "Current Weight (lb)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    weightRange: "Weight Range",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretCategoryBeforeActing: "Interpret the category before acting",
    knowledge: "Knowledge",
    idealWeightMeaning: "What Ideal Weight means in the Health universe",
    definition: "Definition",
    definitionText: "Ideal weight is the healthy weight range calculated based on height. This calculator uses the BMI reverse calculation method with BMI 22 as the center value.",
    limitations: "Limitations",
    limitationsText: "Ideal weight cannot distinguish muscle from fat, consider fat distribution, pregnancy status, or child percentile status.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "BMI, BMR, TDEE, Body Fat, and Waist Ratio tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "Ideal Weight = Height(m) × Height(m) × 22, Ideal Weight Range = Center ± 10%",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "References should include WHO, CDC, and NIH. Ideal weight is a reference metric, not a diagnosis or medical treatment recommendation.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "WHO classification context, CDC BMI screening guidance, and NIH health risk context.",
  },
} as const;

const femaleHeightExampleCm = 160;
const maleHeightExampleCm = 180;

function getIdealWeight(heightCm: number): number {
  const heightM = heightCm / 100;
  return heightM * heightM * 22;
}

function getCategory(currentWeight: number, idealWeight: number): CategoryInfo {
  const min = idealWeight * 0.9;
  const max = idealWeight * 1.1;
  if (currentWeight < min) return categoryInfo[0];
  if (currentWeight <= max) return categoryInfo[1];
  return categoryInfo[2];
}

function formatWeight(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

export default function IdealWeightCalculator() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [currentWeightKg, setCurrentWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [currentWeightLb, setCurrentWeightLb] = useState("154");

  const t = ui[lang];

  const calculation = useMemo(() => {
    if (unitSystem === "metric") {
      const hCm = Number(heightCm);
      const weight = Number(currentWeightKg);
      if (!hCm || !weight || hCm <= 0 || weight <= 0) return null;
      const idealWeight = getIdealWeight(hCm);
      return { heightCm: hCm, currentWeight: weight, idealWeight, category: getCategory(weight, idealWeight) };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const weightLb = Number(currentWeightLb);
    if (!totalInches || !weightLb || totalInches <= 0 || weightLb <= 0) return null;
    const hCm = totalInches * 2.54;
    const weightKg = weightLb * 0.45359237;
    const idealWeight = getIdealWeight(hCm);
    return { heightCm: hCm, currentWeight: weightKg, idealWeight, category: getCategory(weightKg, idealWeight) };
  }, [feet, heightCm, inches, currentWeightKg, currentWeightLb, unitSystem]);

  const activeCategory = calculation?.category ?? categoryInfo[1];
  const femaleIdealWeight = getIdealWeight(femaleHeightExampleCm);
  const maleIdealWeight = getIdealWeight(maleHeightExampleCm);

  function fillFemaleExample() {
    setUnitSystem("metric");
    setHeightCm("160");
    setCurrentWeightKg("56");
  }

  function fillMaleExample() {
    setUnitSystem("metric");
    setHeightCm("180");
    setCurrentWeightKg("71");
  }

  const displayIdealWeight = calculation?.idealWeight ? formatWeight(calculation.idealWeight) : "—";
  const displayIdealMin = calculation?.idealWeight ? formatWeight(calculation.idealWeight * 0.9) : "—";
  const displayIdealMax = calculation?.idealWeight ? formatWeight(calculation.idealWeight * 1.1) : "—";
  const displayWeightDiff = calculation ? formatWeight(calculation.currentWeight - calculation.idealWeight) : "—";

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
                  <div className="text-xs font-bold uppercase text-blue-100">{t.idealWeightPreview}</div>
                  <div className="text-3xl font-black">{formatWeight(femaleIdealWeight)}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.femaleHeight}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.height}</div><div className="mt-1 text-lg font-black">160cm</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weight}</div><div className="mt-1 text-lg font-black">{formatWeight(femaleIdealWeight)}kg</div></div>
              </div>
              <button onClick={fillFemaleExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillFemaleExample}
              </button>
              <button onClick={fillMaleExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewHighWeightPath}
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
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("metric")}>{t.metric}</button>
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("imperial")}>{t.imperial}</button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillFemaleExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.femaleHeight}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{formatWeight(femaleIdealWeight)}kg</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillMaleExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.maleHeight}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.highWeightPathDescription}</p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {unitSystem === "metric" ? (
                    <>
                      <label className="block text-sm font-black text-slate-700">{t.heightCm}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.currentWeightKg}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentWeightKg} onChange={(e) => setCurrentWeightKg(e.target.value)} /></label>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-black text-slate-700">{t.feet}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feet} onChange={(e) => setFeet(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.inches}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inches} onChange={(e) => setInches(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.currentWeightLb}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentWeightLb} onChange={(e) => setCurrentWeightLb(e.target.value)} /></label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeCategory.tone}`} aria-label="Color band placeholder" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{displayIdealWeight}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeCategory.label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.status}</div>
                    <div className="mt-1 text-xl font-black">{displayIdealMin} - {displayIdealMax}</div>
                    <div className="mt-1 text-xs text-slate-300">{t.weightRange}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weightRange}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeCategory.meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeCategory.actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeCategory.nextTool, lang)}</p></div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretCategoryBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categoryInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeCategory.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <h3 className="font-black">{l(item.label, lang)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Knowledge Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
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
          </section>

          {/* FAQ Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "理想體重與 BMI 有什麼區別？" : "What is the difference between ideal weight and BMI?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "BMI 根據當前體重計算分類，理想體重根據身高計算目標範圍。兩者互補。" : "BMI calculates classification based on current weight, ideal weight calculates target range based on height. They complement each other."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "為什麼用 BMI 22？" : "Why use BMI 22?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "BMI 22 是健康 BMI 範圍（18.5-24.9）的中心，被多個衛生機構認可。" : "BMI 22 is the center of the healthy BMI range (18.5-24.9), recognized by multiple health organizations."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "體重超出範圍怎麼辦？" : "What if my weight is outside the range?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "計算 BMI、BMR、TDEE，制定體重管理計劃。如差異大，尋求專業指導。" : "Calculate BMI, BMR, TDEE to plan weight management. Seek professional guidance if difference is significant."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "適用於所有人嗎？" : "Is it applicable to everyone?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "適用於成年人。兒童、運動員、孕婦需諮詢專業人員。" : "Suitable for adults. Children, athletes, and pregnant women should consult professionals."}</p>
              </div>
            </div>
          </section>

          {/* Related Tools Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.relatedTools}</p>
            <h2 className="mt-2 text-3xl font-black">{t.semanticNeighbors}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <a href="/tools/health/bmi-calculator" className="rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:border-blue-500">
                <h3 className="font-black text-blue-900">BMI {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-blue-800">{lang === "zh" ? "評估當前體重狀況" : "Assess current weight status"}</p>
              </a>
              <a href="/tools/health/bmr-calculator" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <h3 className="font-black">BMR {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-slate-700">{lang === "zh" ? "計算基礎代謝率" : "Calculate basal metabolic rate"}</p>
              </a>
              <a href="/tools/health/tdee-calculator" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <h3 className="font-black">TDEE {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-slate-700">{lang === "zh" ? "規劃每日熱量需求" : "Plan daily calorie needs"}</p>
              </a>
            </div>
          </section>

          {/* References Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.references}</p>
            <h2 className="mt-2 text-3xl font-black">{t.trustRelatedReferences}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-black mb-3">{t.trust}</h3>
                <p className="text-sm leading-6 text-slate-700">{t.trustText}</p>
              </div>
              <div>
                <h3 className="font-black mb-3">{t.references}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.who.int/tools/bmi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">WHO - Body Mass Index</a></li>
                  <li><a href="https://www.cdc.gov/bmi/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CDC - About Adult BMI</a></li>
                  <li><a href="https://www.mdcalc.com/calc/68/ideal-body-weight-adjusted-body-weight" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MDCalc - Ideal Body Weight</a></li>
                  <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10621523/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NIH - Ideal Body Weight Formulae</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ad Slots */}
          <AdSlot slot="ideal-weight-knowledge" position="bottom" />
        </div>
      </div>

      {/* Sidebar with Premium Gate */}
      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="ideal-weight-sidebar" position="top" />
        <PremiumGate />
        <AdSlot slot="ideal-weight-sidebar" position="bottom" />
      </div>

      {/* Footer Ad */}
      <AdSlot slot="ideal-weight-footer" position="footer" />
    </main>
  );
}
