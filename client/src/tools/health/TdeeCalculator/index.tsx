import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: ActivityLevel;
  label: LocalText;
  coefficient: number;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const activityInfo: CategoryInfo[] = [
  {
    key: "sedentary",
    label: { zh: "久坐不動", en: "Sedentary" },
    coefficient: 1.2,
    tone: "from-blue-400 via-blue-300 to-slate-200",
    meaning: { zh: "幾乎沒有運動，主要是辦公室工作或日常活動。", en: "Little or no exercise, mainly office work or daily activities." },
    risks: { zh: "久坐可能與代謝風險升高、肌肉流失有關。", en: "Sedentary lifestyle may be associated with higher metabolic risk and muscle loss." },
    actions: { zh: "建議增加日常活動量，如散步、站立工作、輕度運動。", en: "Increase daily activity, such as walking, standing work, light exercise." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "light",
    label: { zh: "輕度活動", en: "Light Activity" },
    coefficient: 1.375,
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "每週運動 1-3 天，或工作涉及適度身體活動。", en: "Exercise 1-3 days per week, or work involves moderate physical activity." },
    risks: { zh: "適度的活動水平通常與較低的代謝風險相關。", en: "Moderate activity level is usually associated with lower metabolic risk." },
    actions: { zh: "維持現有活動水平，逐步增加運動強度或頻率。", en: "Maintain current activity level, gradually increase exercise intensity or frequency." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "moderate",
    label: { zh: "中度活動", en: "Moderate Activity" },
    coefficient: 1.55,
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "每週運動 3-5 天，或工作涉及大量身體活動。", en: "Exercise 3-5 days per week, or work involves significant physical activity." },
    risks: { zh: "中度活動水平與良好的代謝健康相關。", en: "Moderate activity level is associated with good metabolic health." },
    actions: { zh: "維持規律運動習慣，注意營養均衡和充足睡眠。", en: "Maintain regular exercise habits, ensure balanced nutrition and adequate sleep." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "active",
    label: { zh: "活躍", en: "Active" },
    coefficient: 1.725,
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "每週運動 5-6 天，或工作涉及高強度身體活動。", en: "Exercise 5-6 days per week, or work involves high-intensity physical activity." },
    risks: { zh: "高活動水平通常與良好的代謝健康相關，但需注意恢復和營養。", en: "High activity level usually associated with good metabolic health, but recovery and nutrition are important." },
    actions: { zh: "確保充足的蛋白質攝入、充足睡眠和適當的恢復時間。", en: "Ensure adequate protein intake, sufficient sleep, and appropriate recovery time." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "veryActive",
    label: { zh: "非常活躍", en: "Very Active" },
    coefficient: 1.9,
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "每週運動 6-7 天，或從事高強度運動或體力勞動工作。", en: "Exercise 6-7 days per week, or engage in high-intensity sports or physical labor." },
    risks: { zh: "非常高的活動水平需要特別注意營養、恢復和防止過度訓練。", en: "Very high activity level requires special attention to nutrition, recovery, and preventing overtraining." },
    actions: { zh: "確保充足的熱量攝入、蛋白質、微量營養素和充足睡眠。", en: "Ensure adequate calorie intake, protein, micronutrients, and sufficient sleep." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
];

const ui = {
  zh: {
    badge: "健康 · 能量代謝 · Gold Tool",
    title: "TDEE 計算機・每日熱量需求指南",
    subtitle: "TDEE 計算機引導體驗",
    intro: "根據基礎代謝率和活動等級計算每日總熱量消耗，快速了解您的能量需求，並延伸到熱量赤字、體重管理等下一步工具。",
    trustNoteLabel: "信任提醒：",
    trustNote: "TDEE 是估算值，不是精確測量。實際熱量消耗因個人代謝、運動強度、飲食等多因素影響。",
    quickActionCard: "快速範例卡",
    tryCommonActivityExample: "試用常見活動等級範例",
    tdeePreview: "TDEE 預覽",
    example: "範例",
    sedentaryExample: "久坐工作者",
    activeExample: "活躍運動者",
    weight: "體重",
    height: "身高",
    oneClickFillSedentaryExample: "一鍵填入久坐工作者範例",
    previewActiveActivityPath: "預覽活躍運動者決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    metric: "公制",
    imperial: "英制",
    exampleCards: "範例卡",
    activeActivityPathDemo: "活躍活動路徑示範",
    oneClickFillAllowed: "30 歲女性 · 可一鍵填入",
    highActivityPathDescription: "35 歲男性 · 展示 TDEE → 熱量赤字 → 體重管理路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    heightCm: "身高（cm）",
    weightKg: "體重（kg）",
    age: "年齡",
    gender: "性別",
    male: "男性",
    female: "女性",
    feet: "英尺",
    inches: "英寸",
    weightLb: "體重（lb）",
    activityLevel: "活動等級",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    dailyCalories: "每日熱量",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretActivityBeforeActing: "行動前先理解活動等級",
    knowledge: "知識",
    tdeeMeaning: "TDEE 在健康宇宙中的意義",
    definition: "定義",
    definitionText: "TDEE（Total Daily Energy Expenditure）是指一個人在一天內消耗的總熱量，包括基礎代謝率（BMR）和活動消耗。",
    limitations: "限制",
    limitationsText: "TDEE 是估算值，不考慮個人代謝差異、激素變化、消化效應等因素。實際消耗可能有 ±20% 的差異。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "BMR、熱量赤字、體重管理、BMI、理想體重等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "TDEE = BMR × 活動係數（1.2/1.375/1.55/1.725/1.9）",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "TDEE 是基於科學公式的估算值，用於規劃熱量攝入。實際需求因人而異，建議結合個人反饋進行調整。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "美國運動醫學會（ACSM）、國際運動營養學會（ISSN）、NIH 熱量指引。",
  },
  en: {
    badge: "Health · Energy Metabolism · Gold Tool",
    title: "TDEE Calculator · Daily Calorie Needs Guide",
    subtitle: "TDEE Calculator guided experience",
    intro: "Calculate your Total Daily Energy Expenditure based on basal metabolic rate and activity level, quickly understand your energy needs, and continue to calorie deficit, weight management, and other next tools.",
    trustNoteLabel: "Trust note:",
    trustNote: "TDEE is an estimate, not a precise measurement. Actual calorie expenditure is influenced by individual metabolism, exercise intensity, diet, and other factors.",
    quickActionCard: "Quick Action Card",
    tryCommonActivityExample: "Try a common activity level example",
    tdeePreview: "TDEE preview",
    example: "Example",
    sedentaryExample: "Sedentary office worker",
    activeExample: "Active exerciser",
    weight: "Weight",
    height: "Height",
    oneClickFillSedentaryExample: "One-click fill sedentary worker example",
    previewActiveActivityPath: "Preview active exerciser decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    metric: "Metric",
    imperial: "Imperial",
    exampleCards: "Example cards",
    activeActivityPathDemo: "Active activity path demo",
    oneClickFillAllowed: "30-year-old female · one-click fill allowed",
    highActivityPathDescription: "35-year-old male · shows TDEE → Calorie Deficit → Weight Management path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    heightCm: "Height (cm)",
    weightKg: "Weight (kg)",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    feet: "Feet",
    inches: "Inches",
    weightLb: "Weight (lb)",
    activityLevel: "Activity Level",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    dailyCalories: "Daily Calories",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretActivityBeforeActing: "Interpret the activity level before acting",
    knowledge: "Knowledge",
    tdeeMeaning: "What TDEE means in the Health universe",
    definition: "Definition",
    definitionText: "TDEE (Total Daily Energy Expenditure) is the total calories a person burns in a day, including basal metabolic rate (BMR) and activity expenditure.",
    limitations: "Limitations",
    limitationsText: "TDEE is an estimate that does not account for individual metabolic differences, hormonal changes, thermic effect of food, and other factors. Actual expenditure may vary by ±20%.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "BMR, Calorie Deficit, Weight Management, BMI, Ideal Weight, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "TDEE = BMR × Activity Coefficient (1.2/1.375/1.55/1.725/1.9)",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "TDEE is an estimate based on scientific formulas for planning calorie intake. Actual needs vary by individual, and adjustment based on personal feedback is recommended.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "American College of Sports Medicine (ACSM), International Society of Sports Nutrition (ISSN), NIH Calorie Guidelines.",
  },
} as const;

function calculateBmr(weightKg: number, heightCm: number, age: number, gender: "male" | "female"): number {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

function getActivityInfo(activity: ActivityLevel): CategoryInfo {
  return activityInfo.find((a) => a.key === activity) || activityInfo[2];
}

function formatCalories(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toString() : "—";
}

export default function TdeeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [weightLb, setWeightLb] = useState("154");

  const t = ui[lang];

  const calculation = useMemo(() => {
    if (unitSystem === "metric") {
      const hCm = Number(heightCm);
      const wKg = Number(weightKg);
      const a = Number(age);
      if (!hCm || !wKg || !a || hCm <= 0 || wKg <= 0 || a <= 0) return null;
      const bmr = calculateBmr(wKg, hCm, a, gender);
      const actInfo = getActivityInfo(activityLevel);
      const tdee = bmr * actInfo.coefficient;
      return { bmr, tdee, activityInfo: actInfo };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const wLb = Number(weightLb);
    const a = Number(age);
    if (!totalInches || !wLb || !a || totalInches <= 0 || wLb <= 0 || a <= 0) return null;
    const hCm = totalInches * 2.54;
    const wKg = wLb * 0.45359237;
    const bmr = calculateBmr(wKg, hCm, a, gender);
    const actInfo = getActivityInfo(activityLevel);
    const tdee = bmr * actInfo.coefficient;
    return { bmr, tdee, activityInfo: actInfo };
  }, [feet, heightCm, inches, weightKg, age, gender, activityLevel, unitSystem]);

  const activeActivityInfo = calculation?.activityInfo ?? activityInfo[2];
  const displayTdee = calculation?.tdee ? formatCalories(calculation.tdee) : "—";
  const displayBmr = calculation?.bmr ? formatCalories(calculation.bmr) : "—";

  function fillSedentaryExample() {
    setUnitSystem("metric");
    setHeightCm("165");
    setWeightKg("60");
    setAge("30");
    setGender("female");
    setActivityLevel("sedentary");
  }

  function fillActiveExample() {
    setUnitSystem("metric");
    setHeightCm("180");
    setWeightKg("80");
    setAge("35");
    setGender("male");
    setActivityLevel("active");
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
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonActivityExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.tdeePreview}</div>
                  <div className="text-3xl font-black">2200</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.sedentaryExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.age}</div><div className="mt-1 text-lg font-black">30</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weight}</div><div className="mt-1 text-lg font-black">60kg</div></div>
              </div>
              <button onClick={fillSedentaryExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillSedentaryExample}
              </button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewActiveActivityPath}
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
                  <button onClick={fillSedentaryExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.sedentaryExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">1.2x</span></div>
                    <p className="mt-2 text-sm text-slate-600">30 {lang === "zh" ? "歲女性" : "year old female"}</p>
                  </button>
                  <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.highActivityPathDescription}</p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {unitSystem === "metric" ? (
                    <>
                      <label className="block text-sm font-black text-slate-700">{t.heightCm}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.weightKg}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.age}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.gender}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-black text-slate-700">{t.feet}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feet} onChange={(e) => setFeet(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.inches}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inches} onChange={(e) => setInches(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.weightLb}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.age}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label>
                      <label className="block text-sm font-black text-slate-700">{t.gender}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label>
                    </>
                  )}
                  <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.activityLevel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>{activityInfo.map((a) => (<option key={a.key} value={a.key}>{l(a.label, lang)} ({a.coefficient}x)</option>))}</select></label>
                </div>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeActivityInfo.tone}`} aria-label="Color band placeholder" />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{displayTdee}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeActivityInfo.label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.status}</div>
                    <div className="mt-1 text-xl font-black">{displayBmr}</div>
                    <div className="mt-1 text-xs text-slate-300">BMR</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.dailyCalories}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeActivityInfo.meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeActivityInfo.actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeActivityInfo.nextTool, lang)}</p></div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretActivityBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {activityInfo.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeActivityInfo.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-2"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.coefficient}x</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Knowledge Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.tdeeMeaning}</h2>
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
                <h3 className="font-black">Q1: {lang === "zh" ? "TDEE 和 BMR 有什麼區別？" : "What is the difference between TDEE and BMR?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "BMR 是靜息時的熱量消耗，TDEE 是加上活動後的總消耗。TDEE = BMR × 活動係數。" : "BMR is calories burned at rest, TDEE is total calories burned including activity. TDEE = BMR × Activity Coefficient."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "活動係數如何選擇？" : "How to choose the activity coefficient?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "根據每週運動天數和強度：久坐 1.2、輕度 1.375、中度 1.55、活躍 1.725、非常活躍 1.9。" : "Based on weekly exercise days and intensity: Sedentary 1.2, Light 1.375, Moderate 1.55, Active 1.725, Very Active 1.9."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "TDEE 用來做什麼？" : "What is TDEE used for?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "TDEE 是規劃熱量攝入的基礎。減重時攝入 < TDEE，增肌時攝入 > TDEE。" : "TDEE is the basis for planning calorie intake. For weight loss, eat less than TDEE; for muscle gain, eat more than TDEE."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "TDEE 估算有多準確？" : "How accurate is TDEE estimation?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "TDEE 是估算值，實際消耗可能有 ±20% 的差異。建議根據實際體重變化進行調整。" : "TDEE is an estimate with possible ±20% variance. Adjust based on actual weight changes."}</p>
              </div>
            </div>
          </section>

          {/* Related Tools Section */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.relatedTools}</p>
            <h2 className="mt-2 text-3xl font-black">{t.semanticNeighbors}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <a href="/tools/health/bmr-calculator" className="rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:border-blue-500">
                <h3 className="font-black text-blue-900">BMR {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-blue-800">{lang === "zh" ? "計算基礎代謝率" : "Calculate basal metabolic rate"}</p>
              </a>
              <a href="/tools/health/calorie-deficit-calculator" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <h3 className="font-black">{lang === "zh" ? "熱量赤字計算機" : "Calorie Deficit Calculator"}</h3>
                <p className="mt-2 text-sm text-slate-700">{lang === "zh" ? "規劃熱量赤字" : "Plan calorie deficit"}</p>
              </a>
              <a href="/tools/health/bmi-calculator" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <h3 className="font-black">BMI {lang === "zh" ? "計算機" : "Calculator"}</h3>
                <p className="mt-2 text-sm text-slate-700">{lang === "zh" ? "評估體重狀況" : "Assess weight status"}</p>
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
                  <li><a href="https://www.acsm.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ACSM - American College of Sports Medicine</a></li>
                  <li><a href="https://www.issn.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ISSN - International Society of Sports Nutrition</a></li>
                  <li><a href="https://www.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NIH - National Institutes of Health</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ad Slots */}
          <AdSlot slot="tdee-knowledge" position="bottom" />
        </div>
      </div>

      {/* Sidebar with Premium Gate */}
      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="tdee-sidebar" position="top" />
        <PremiumGate />
        <AdSlot slot="tdee-sidebar" position="bottom" />
      </div>

      {/* Footer Ad */}
      <AdSlot slot="tdee-footer" position="footer" />
    </main>
  );
}
