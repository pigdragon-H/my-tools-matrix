import { useMemo, useState } from "react";

type UnitSystem = "metric" | "imperial";
type BmiCategory = "underweight" | "normal" | "overweight" | "obesity1" | "obesity2" | "obesity3";

type CategoryInfo = {
  key: BmiCategory;
  label: string;
  range: string;
  band: string;
  tone: string;
  meaning: string;
  risks: string;
  actions: string;
  nextTool: string;
  tools: string[];
};

const categoryInfo: CategoryInfo[] = [
  {
    key: "underweight",
    label: "Underweight",
    range: "Below 18.5",
    band: "Low BMI band",
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: "Weight may be low relative to height for standard adult BMI categories.",
    risks: "Possible undernutrition, fatigue, reduced resilience, or unintended weight loss context. BMI does not diagnose these conditions.",
    actions: "Review nutrition, recent weight change, appetite, activity, and symptoms. Seek professional guidance if low BMI is unexplained or persistent.",
    nextTool: "BMR Calculator",
    tools: ["BMR Calculator", "Calories Calculator", "Ideal Weight Guide"],
  },
  {
    key: "normal",
    label: "Normal",
    range: "18.5–24.9",
    band: "Healthy screening band",
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: "BMI is within the standard adult healthy weight screening range.",
    risks: "Population-level risk is generally lower, but BMI does not guarantee metabolic health or ideal body composition.",
    actions: "Maintain balanced nutrition, movement, sleep, hydration, and preventive care. Use body composition tools for deeper context.",
    nextTool: "TDEE Calculator",
    tools: ["TDEE Calculator", "Body Fat Calculator", "Water Intake Calculator"],
  },
  {
    key: "overweight",
    label: "Overweight",
    range: "25.0–29.9",
    band: "Elevated BMI band",
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: "Weight may be above the standard healthy range for height.",
    risks: "May be associated with higher cardiometabolic risk, depending on body composition and fat distribution.",
    actions: "Check BMR, TDEE, calorie planning, waist ratio, and body fat context before making weight-management decisions.",
    nextTool: "BMR Calculator",
    tools: ["BMR Calculator", "TDEE Calculator", "Calories Calculator", "Body Fat Calculator"],
  },
  {
    key: "obesity1",
    label: "Obesity I",
    range: "30.0–34.9",
    band: "High BMI band",
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: "BMI falls into Obesity Class I for adults.",
    risks: "Associated at population level with increased likelihood of hypertension, insulin resistance, sleep apnea, and joint stress.",
    actions: "Consider professional guidance and use BMR, TDEE, and body composition tools for context.",
    nextTool: "BMR Calculator",
    tools: ["TDEE Calculator", "Calories Calculator", "Body Fat Calculator"],
  },
  {
    key: "obesity2",
    label: "Obesity II",
    range: "35.0–39.9",
    band: "Very high BMI band",
    tone: "from-red-500 via-rose-600 to-purple-700",
    meaning: "BMI falls into Obesity Class II for adults.",
    risks: "Associated with higher population-level weight-related health risks.",
    actions: "Professional assessment is recommended before major lifestyle or weight-management changes.",
    nextTool: "TDEE Calculator",
    tools: ["BMR Calculator", "TDEE Calculator", "Calories Calculator", "Body Fat Calculator"],
  },
  {
    key: "obesity3",
    label: "Obesity III",
    range: "40.0 and above",
    band: "Highest BMI band",
    tone: "from-red-700 via-purple-800 to-slate-950",
    meaning: "BMI falls into Obesity Class III for adults.",
    risks: "Associated with very high population-level weight-related health risk.",
    actions: "Seek qualified medical guidance. Calculators can provide context but should not replace professional care.",
    nextTool: "Clinical guidance + BMR Calculator",
    tools: ["BMR Calculator", "TDEE Calculator", "Body Fat Calculator"],
  },
];

const faqItems = [
  ["Is BMI a diagnosis?", "No. BMI is a screening tool and does not diagnose health status, disease, or body fat percentage."],
  ["What is a healthy BMI?", "For most adults, 18.5–24.9 is commonly categorized as the healthy BMI range."],
  ["Can athletes have misleading BMI?", "Yes. High muscle mass can raise BMI even when body fat is not elevated."],
  ["Is BMI valid for children?", "Children and teens need age- and sex-specific percentile interpretation, not adult categories."],
  ["Can BMI be used during pregnancy?", "Pregnancy requires clinical context. Standard adult BMI interpretation is not enough."],
  ["What should I check after BMI?", "BMR, TDEE, Calories, Body Fat, and waist-based metrics can provide more context."],
];

const adultMaleExampleBmi = 70 / (1.75 * 1.75);

function getCategory(bmi: number): CategoryInfo {
  if (bmi < 18.5) return categoryInfo[0];
  if (bmi < 25) return categoryInfo[1];
  if (bmi < 30) return categoryInfo[2];
  if (bmi < 35) return categoryInfo[3];
  if (bmi < 40) return categoryInfo[4];
  return categoryInfo[5];
}

function formatBmi(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}

export default function BmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");

  const calculation = useMemo(() => {
    if (unitSystem === "metric") {
      const heightM = Number(heightCm) / 100;
      const weight = Number(weightKg);
      if (!heightM || !weight || heightM <= 0 || weight <= 0) return null;
      const bmi = weight / (heightM * heightM);
      return { bmi, category: getCategory(bmi) };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const weight = Number(pounds);
    if (!totalInches || !weight || totalInches <= 0 || weight <= 0) return null;
    const bmi = (703 * weight) / (totalInches * totalInches);
    return { bmi, category: getCategory(bmi) };
  }, [feet, heightCm, inches, pounds, unitSystem, weightKg]);

  const activeCategory = calculation?.category ?? categoryInfo[1];
  const activeBmi = calculation?.bmi;
  const goalBmi = 23;
  const currentMetricHeightM = Number(heightCm) / 100;
  const goalWeightKg = currentMetricHeightM > 0 ? goalBmi * currentMetricHeightM * currentMetricHeightM : null;
  const currentWeightKg = unitSystem === "metric" ? Number(weightKg) : Number(pounds) * 0.45359237;
  const neededWeightChangeKg = goalWeightKg && currentWeightKg > 0 ? goalWeightKg - currentWeightKg : null;
  const neededWeightDisplay = neededWeightChangeKg ? `${neededWeightChangeKg > 0 ? "+" : ""}${Math.round(neededWeightChangeKg)}kg` : "—";

  function fillAdultMaleExample() {
    setUnitSystem("metric");
    setHeightCm("175");
    setWeightKg("70");
  }

  function fillHighBmiExample() {
    setUnitSystem("metric");
    setHeightCm("170");
    setWeightKg("88");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">Health · Biometrics · Gold Tool</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">BMI 計算機・完整健康評估</h1>
              <p className="text-xl font-black text-blue-700">BMI Calculator guided experience</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                透過 BMI 作為健康篩檢起點，快速計算身體質量指數、理解風險訊號，並延伸到 BMR、TDEE、熱量與體脂等下一步工具。Move through BMI as a guided health screening flow: start with a quick example, calculate your score, understand the risk signal, and continue to the most useful next tool.
              </p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>Trust note:</strong> BMI is a screening tool, not a diagnosis. It does not directly measure body fat, athletic body composition, pregnancy context, or child percentile status.
              </div>
            </section>

            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Quick Action Card</p>
                  <h2 className="mt-2 text-2xl font-black">Try a common adult example</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">BMI preview</div>
                  <div className="text-3xl font-black">{formatBmi(adultMaleExampleBmi)}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Example</div><div className="mt-1 text-lg font-black">Adult male</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Weight</div><div className="mt-1 text-lg font-black">70kg</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Height</div><div className="mt-1 text-lg font-black">175cm</div></div>
              </div>
              <button onClick={fillAdultMaleExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                One-click fill adult male example
              </button>
              <button onClick={fillHighBmiExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                Preview high BMI decision path
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Examples → Calculator</p>
                <h2 className="mt-2 text-3xl font-black">Enter or fill values</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("metric")}>Metric</button>
                <button className={`rounded-xl px-4 py-3 text-sm font-black ${unitSystem === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnitSystem("imperial")}>Imperial</button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">Example cards</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillAdultMaleExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">Adult male</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">BMI {formatBmi(adultMaleExampleBmi)}</span></div>
                    <p className="mt-2 text-sm text-slate-600">70kg · 175cm · one-click fill allowed</p>
                  </button>
                  <button onClick={fillHighBmiExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">High BMI path demo</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">Flow demo</span></div>
                    <p className="mt-2 text-sm text-slate-600">88kg · 170cm · shows BMR → TDEE → Calories path.</p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">Calculator</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {unitSystem === "metric" ? (
                    <>
                      <label className="block text-sm font-black text-slate-700">Height (cm)<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">Weight (kg)<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></label>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-black text-slate-700">Feet<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feet} onChange={(e) => setFeet(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">Inches<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inches} onChange={(e) => setInches(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700 md:col-span-2">Weight (lb)<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={pounds} onChange={(e) => setPounds(e.target.value)} /></label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeCategory.tone}`} aria-label="Color band placeholder" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Result Card</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{activeBmi ? formatBmi(activeBmi) : "—"}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{activeBmi ? activeCategory.label : "Enter valid values"}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">Status</div>
                    <div className="mt-1 text-xl font-black">{activeCategory.range}</div>
                    <div className="mt-1 text-xs text-slate-300">{activeCategory.band}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Risk summary</div><p className="mt-2 text-sm leading-6 text-slate-700">{activeCategory.risks}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Recommended action</div><p className="mt-2 text-sm leading-6 text-slate-700">{activeCategory.actions}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">Related next tool</div><p className="mt-2 text-base font-black text-blue-950">{activeCategory.nextTool}</p></div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Result Intelligence</p>
              <h2 className="mt-2 text-3xl font-black">Interpret the category before acting</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categoryInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeCategory.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-3"><h3 className="font-black">{item.label}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.meaning}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">Emotion + Conversion Layer</p>
            <h2 className="mt-2 text-3xl font-black">Turn the BMI result into a health journey</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">This prototype layer adds retention and conversion prompts after the result without implementing save, share, account, or navigation behavior.</p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Progress Insight Card</p>
                    <h3 className="mt-2 text-2xl font-black">Your possible progress target</h3>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">Timeline</div>
                    <div className="text-sm font-black">Estimated timeline placeholder</div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Current BMI</div><div className="mt-1 text-3xl font-black">{activeBmi ? formatBmi(activeBmi) : "—"}</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">Goal</div><div className="mt-1 text-3xl font-black text-blue-950">23</div></div>
                  <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">Needed</div><div className="mt-1 text-3xl font-black text-emerald-950">{neededWeightDisplay}</div></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">Needed weight is a prototype estimate based on the current height and a goal BMI of 23. It is not a medical recommendation.</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Motivation Card</p>
                <h3 className="mt-2 text-2xl font-black">Keep momentum after the score</h3>
                <div className="mt-5 rounded-2xl bg-pink-50 p-4">
                  <div className="text-xs font-black uppercase text-pink-700">Target BMI range</div>
                  <div className="mt-1 text-3xl font-black text-pink-950">18.5–24.9</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["BMR", "TDEE", "Calories", "Weight Loss"].map((tool) => (
                    <div key={tool} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{tool}</div>
                  ))}
                </div>
              </article>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.55fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Health Journey</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
                  {["Current", "BMI", "BMR", "Calories", "Progress"].map((node, index) => (
                    <div key={node} className="contents">
                      <div className={`rounded-2xl border p-4 text-center ${index === 4 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
                        <div className="text-xs font-black uppercase text-slate-500">{index === 0 ? "Start" : `Step ${index}`}</div>
                        <div className="mt-1 text-lg font-black">{node}</div>
                      </div>
                      {index < 4 && <div className="hidden text-2xl font-black text-slate-300 md:block">→</div>}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Save / Share placeholder</p>
                <h3 className="mt-2 text-xl font-black">Save this result or share the journey</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">UI placeholder only. No account, storage, sharing, or export implementation is included in this prototype.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Save UI</button>
                  <button type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">Share UI</button>
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Decision Path</p>
            <h2 className="mt-2 text-3xl font-black">If BMI is high, continue through the energy path</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              {["BMI high", "BMR", "TDEE", "Calories"].map((node, index) => (
                <div key={node} className="contents">
                  <div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
                    <div className="text-xs font-black uppercase text-slate-500">Step {index + 1}</div>
                    <div className="mt-1 text-xl font-black">{node}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{index === 0 ? "Screening signal" : index === 1 ? "Resting energy" : index === 2 ? "Daily needs" : "Plan intake"}</p>
                  </div>
                  {index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Knowledge</p>
              <h2 className="mt-2 text-3xl font-black">What BMI means in the Health universe</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">Definition</h3><p className="mt-2 text-sm leading-6 text-slate-700">BMI compares adult weight with height using weight divided by squared height.</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">Limitations</h3><p className="mt-2 text-sm leading-6 text-slate-700">BMI does not measure body fat, muscle mass, fat distribution, pregnancy status, or child percentile status.</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">Semantic neighbors</h3><p className="mt-2 text-sm leading-6 text-slate-700">BMR, TDEE, Calories, Body Fat, Water Intake, and Waist Ratio expand the result context.</p></div>
              </div>
              <pre className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">Metric: BMI = weight(kg) / height(m)²{"\n"}Imperial: BMI = 703 × weight(lb) / height(in)²</pre>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">FAQ</p>
              <h2 className="mt-2 text-3xl font-black">Common questions</h2>
              <div className="mt-5 space-y-3">
                {faqItems.slice(0, 5).map(([q, a]) => (
                  <details key={q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer font-black">{q}</summary>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{a}</p>
                  </details>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Trust · Related Tools · References</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">Trust</h2><p className="mt-2 text-sm leading-6 text-slate-700">References should include WHO, CDC, and NIH. BMI is a screening metric, not a diagnosis or medical treatment recommendation.</p></div>
              <div><h2 className="text-xl font-black">Related Tools</h2><p className="mt-2 text-sm leading-6 text-slate-700">BMR · TDEE · Calories · Body Fat · Water Intake · Waist Ratio</p></div>
              <div><h2 className="text-xl font-black">References</h2><p className="mt-2 text-sm leading-6 text-slate-700">WHO classification context, CDC BMI screening guidance, and NIH health risk context.</p></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}