import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import zh from "./locales/zh";
import en from "./locales/en";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type TdeeCategory = "veryLow" | "low" | "moderate" | "high" | "veryHigh";
type LocalText = { zh: string; en: string };

type ActivityInfo = {
  key: ActivityLevel;
  label: LocalText;
  multiplier: number;
  description: LocalText;
};

type CategoryInfo = {
  key: TdeeCategory;
  label: LocalText;
  range: LocalText;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const activityLevels: ActivityInfo[] = [
  {
    key: "sedentary",
    label: { zh: "久坐不動", en: "Sedentary" },
    multiplier: 1.2,
    description: { zh: "幾乎沒有運動或運動很少", en: "Little or no exercise" },
  },
  {
    key: "light",
    label: { zh: "輕度活動", en: "Light" },
    multiplier: 1.375,
    description: { zh: "每週運動 1-3 天", en: "Exercise 1-3 days/week" },
  },
  {
    key: "moderate",
    label: { zh: "中度活動", en: "Moderate" },
    multiplier: 1.55,
    description: { zh: "每週運動 3-5 天", en: "Exercise 3-5 days/week" },
  },
  {
    key: "active",
    label: { zh: "活躍", en: "Active" },
    multiplier: 1.725,
    description: { zh: "每週運動 6-7 天", en: "Exercise 6-7 days/week" },
  },
  {
    key: "veryActive",
    label: { zh: "非常活躍", en: "Very Active" },
    multiplier: 1.9,
    description: { zh: "每天運動或從事體力勞動工作", en: "Daily exercise or physical job" },
  },
];

const categoryInfo: CategoryInfo[] = [
  {
    key: "veryLow",
    label: { zh: "非常低", en: "Very Low" },
    range: { zh: "< 1500 kcal/天", en: "< 1500 kcal/day" },
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "每日總消耗熱量非常低，通常見於久坐且體型較小的人群。", en: "Very low daily energy expenditure, typically seen in sedentary, smaller-framed individuals." },
    risks: { zh: "可能導致營養不足、能量不足、疲勞或代謝效率下降。", en: "May lead to nutritional deficiency, low energy, fatigue, or reduced metabolic efficiency." },
    actions: { zh: "確保攝取足夠的營養，增加日常活動量，避免過度節食。", en: "Ensure adequate nutrition, increase daily activity, avoid extreme dieting." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "low",
    label: { zh: "低", en: "Low" },
    range: { zh: "1500-2000 kcal/天", en: "1500-2000 kcal/day" },
    tone: "from-emerald-400 via-lime-300 to-yellow-200",
    meaning: { zh: "每日總消耗熱量較低，通常見於久坐或輕度活動的人群。", en: "Low daily energy expenditure, typically seen in sedentary or lightly active individuals." },
    risks: { zh: "需要注意飲食品質與營養均衡，避免營養不足。", en: "Pay attention to diet quality and nutritional balance to avoid deficiency." },
    actions: { zh: "維持均衡飲食，逐步增加運動量，定期追蹤體重與能量水平。", en: "Maintain balanced nutrition, gradually increase activity, monitor weight and energy levels." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "moderate",
    label: { zh: "中等", en: "Moderate" },
    range: { zh: "2000-2800 kcal/天", en: "2000-2800 kcal/day" },
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    meaning: { zh: "每日總消耗熱量適中，通常見於中度活動的人群。", en: "Moderate daily energy expenditure, typically seen in moderately active individuals." },
    risks: { zh: "代謝水平正常，需要注意飲食與運動的平衡。", en: "Normal metabolic level, balance diet and exercise carefully." },
    actions: { zh: "根據目標（減重、維持或增肌）調整熱量攝取，維持規律運動習慣。", en: "Adjust calorie intake based on goals (weight loss, maintenance, or muscle gain), maintain regular exercise." },
    nextTool: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" },
  },
  {
    key: "high",
    label: { zh: "高", en: "High" },
    range: { zh: "2800-3500 kcal/天", en: "2800-3500 kcal/day" },
    tone: "from-orange-400 via-red-400 to-red-600",
    meaning: { zh: "每日總消耗熱量較高，通常見於活躍或從事體力工作的人群。", en: "High daily energy expenditure, typically seen in active or physically demanding job individuals." },
    risks: { zh: "需要確保充足的熱量與營養攝取，避免能量不足。", en: "Ensure adequate calorie and nutrient intake to avoid energy deficit." },
    actions: { zh: "增加蛋白質與複合碳水化合物攝取，定期監測體重與體組成。", en: "Increase protein and complex carbohydrate intake, monitor weight and body composition regularly." },
    nextTool: { zh: "蛋白質需求計算機", en: "Protein Requirement Calculator" },
  },
  {
    key: "veryHigh",
    label: { zh: "非常高", en: "Very High" },
    range: { zh: "> 3500 kcal/天", en: "> 3500 kcal/day" },
    tone: "from-red-500 via-rose-600 to-purple-700",
    meaning: { zh: "每日總消耗熱量非常高，通常見於非常活躍或從事重體力工作的人群。", en: "Very high daily energy expenditure, typically seen in very active or heavy physical labor individuals." },
    risks: { zh: "需要大量熱量與營養支撐，營養不足可能影響健康與運動表現。", en: "Requires substantial calorie and nutrient support; nutritional deficiency may impact health and performance." },
    actions: { zh: "確保充足的蛋白質、碳水化合物與微量營養素攝取，定期進行營養評估。", en: "Ensure adequate protein, carbohydrate, and micronutrient intake, regular nutritional assessment." },
    nextTool: { zh: "蛋白質需求計算機", en: "Protein Requirement Calculator" },
  },
];

const faqItems: { question: LocalText; answer: LocalText }[] = [
  { question: { zh: "TDEE 和 BMR 有什麼差異？", en: "What's the difference between TDEE and BMR?" }, answer: { zh: "BMR 是靜止狀態下的代謝，TDEE 是加入活動量後的總消耗。TDEE = BMR × 活動係數。", en: "BMR is metabolism at rest; TDEE includes activity. TDEE = BMR × Activity Factor." } },
  { question: { zh: "活動係數如何選擇？", en: "How do I choose the activity level?" }, answer: { zh: "根據每週運動頻率與日常活動量選擇。久坐選 1.2，輕度活動選 1.375，中度選 1.55，活躍選 1.725，非常活躍選 1.9。", en: "Choose based on weekly exercise frequency and daily activity. Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725, Very Active: 1.9." } },
  { question: { zh: "TDEE 用於減重嗎？", en: "Can TDEE be used for weight loss?" }, answer: { zh: "是的。減重需要攝取少於 TDEE 的熱量（通常減 300-500 kcal），但不應低於 BMR。", en: "Yes. Weight loss requires consuming fewer calories than TDEE (typically 300-500 kcal less), but not below BMR." } },
  { question: { zh: "運動會改變 TDEE 嗎？", en: "Does exercise change TDEE?" }, answer: { zh: "是的。增加運動量會提高活動係數，從而增加 TDEE。", en: "Yes. Increasing exercise raises the activity factor, thus increasing TDEE." } },
  { question: { zh: "TDEE 計算需要多久更新一次？", en: "How often should I recalculate TDEE?" }, answer: { zh: "建議每 3-6 個月重新計算一次，特別是在體重、肌肉量或活動量有變化時。", en: "Recalculate every 3-6 months, especially when weight, muscle mass, or activity level changes." } },
];

const getBrowserLang = (): "zh" | "en" => {
  const locale =
    (typeof navigator !== "undefined"
    && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

export default function TdeeCalculator() {
  const [lang, setLang] = useState<"zh" | "en">(getBrowserLang());
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("70");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [pounds, setPounds] = useState("154");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");

  const t = lang === "zh" ? zh : en;

  const calculation = useMemo(() => {
    const genderNum = gender === "male" ? 1 : 0;
    const ageNum = Number(age);

    if (unitSystem === "metric") {
      const heightM = Number(heightCm) / 100;
      const weight = Number(weightKg);
      if (!heightM || !weight || heightM <= 0 || weight <= 0 || ageNum <= 0) return null;

      // Mifflin-St Jeor formula
      const bmr = genderNum === 1
        ? 10 * weight + 6.25 * Number(heightCm) - 5 * ageNum + 5
        : 10 * weight + 6.25 * Number(heightCm) - 5 * ageNum - 161;

      const activityMultiplier = activityLevels.find(a => a.key === activityLevel)?.multiplier || 1.55;
      const tdee = bmr * activityMultiplier;

      return { bmr, tdee, category: getCategory(tdee) };
    }

    const totalInches = Number(feet) * 12 + Number(inches);
    const weight = Number(pounds);
    if (!totalInches || !weight || totalInches <= 0 || weight <= 0 || ageNum <= 0) return null;

    const weightKgConverted = weight * 0.45359237;
    const heightCmConverted = totalInches * 2.54;

    // Mifflin-St Jeor formula
    const bmr = genderNum === 1
      ? 10 * weightKgConverted + 6.25 * heightCmConverted - 5 * ageNum + 5
      : 10 * weightKgConverted + 6.25 * heightCmConverted - 5 * ageNum - 161;

    const activityMultiplier = activityLevels.find(a => a.key === activityLevel)?.multiplier || 1.55;
    const tdee = bmr * activityMultiplier;

    return { bmr, tdee, category: getCategory(tdee) };
  }, [age, feet, gender, heightCm, inches, pounds, unitSystem, weightKg, activityLevel]);

  const activeCategory = calculation?.category ?? categoryInfo[2];
  const activeTdee = calculation?.tdee;
  const activeBmr = calculation?.bmr;

  function getCategory(tdee: number): CategoryInfo {
    if (tdee < 1500) return categoryInfo[0];
    if (tdee < 2000) return categoryInfo[1];
    if (tdee < 2800) return categoryInfo[2];
    if (tdee < 3500) return categoryInfo[3];
    return categoryInfo[4];
  }

  function formatTdee(value: number): string {
    return Number.isFinite(value) ? Math.round(value).toLocaleString() : "—";
  }

  function fillAdultMaleExample() {
    setUnitSystem("metric");
    setGender("male");
    setAge("30");
    setHeightCm("175");
    setWeightKg("70");
    setActivityLevel("moderate");
  }

  function fillActiveExample() {
    setUnitSystem("metric");
    setGender("male");
    setAge("25");
    setHeightCm("180");
    setWeightKg("80");
    setActivityLevel("active");
  }

  const journeyNodes = [t.current, "BMR", "TDEE", t.calories, t.progress];
  const decisionNodes = [t.screeningSignal, "BMR", "TDEE", t.planIntake];
  const decisionDescriptions = [t.activityLevel, t.restingEnergy, t.dailyNeeds, t.calorieIntake];
  const motivationTools = ["BMR", "TDEE", t.calories, t.weightManagement];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
              aria-label={lang === "zh" ? "Switch to English" : "切換到中文"}
            >
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>EN</span>
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
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.tdeePreview}</div>
                  <div className="text-3xl font-black">{activeTdee ? formatTdee(activeTdee) : "—"}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.adultMale}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weight}</div><div className="mt-1 text-lg font-black">70kg</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.height}</div><div className="mt-1 text-lg font-black">175cm</div></div>
              </div>
              <button onClick={fillAdultMaleExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
                {t.oneClickFillExample}
              </button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">
                {t.previewActivePath}
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
                  <button onClick={fillAdultMaleExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.adultMale}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">TDEE {activeTdee ? formatTdee(activeTdee) : "—"}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.activePathDemo}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.activePathDescription}</p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black uppercase text-slate-600">{t.gender}</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-black text-slate-800">
                        <option value="male">{t.male}</option>
                        <option value="female">{t.female}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-slate-600">{t.age}</label>
                      <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="1" max="120" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-800" />
                    </div>
                  </div>

                  {unitSystem === "metric" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-600">{t.height}</label>
                        <div className="mt-2 flex gap-2">
                          <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min="1" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-800" />
                          <span className="flex items-center px-3 font-black text-slate-600">{t.cm}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-600">{t.weight}</label>
                        <div className="mt-2 flex gap-2">
                          <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min="1" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-800" />
                          <span className="flex items-center px-3 font-black text-slate-600">{t.kg}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-600">{t.height}</label>
                        <div className="mt-2 flex gap-2">
                          <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} min="1" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-800" />
                          <span className="flex items-center px-2 font-black text-slate-600">{t.feet}</span>
                          <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} min="0" max="11" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-800" />
                          <span className="flex items-center px-2 font-black text-slate-600">{t.inches}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-600">{t.weight}</label>
                        <div className="mt-2 flex gap-2">
                          <input type="number" value={pounds} onChange={(e) => setPounds(e.target.value)} min="1" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-800" />
                          <span className="flex items-center px-3 font-black text-slate-600">{t.lb}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-black uppercase text-slate-600">{t.activityLevelLabel}</label>
                    <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-black text-slate-800">
                      {activityLevels.map((level) => (
                        <option key={level.key} value={level.key}>{l(level.label, lang)} ({level.multiplier})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ────── Result Card ────── */}
          {calculation && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultBadge}</p>
              <h2 className="mt-2 text-3xl font-black">{t.yourTDEE}</h2>
              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
                <div className={`rounded-3xl border p-6 text-center ${activeCategory.key === "veryLow" || activeCategory.key === "low" ? "border-blue-200 bg-blue-50" : activeCategory.key === "moderate" ? "border-yellow-200 bg-yellow-50" : "border-orange-200 bg-orange-50"}`}>
                  <div className="text-xs font-black uppercase text-slate-600">{t.bmr}</div>
                  <div className="mt-2 text-4xl font-black text-slate-950">{activeBmr ? Math.round(activeBmr).toLocaleString() : "—"}</div>
                  <div className="mt-1 text-sm font-black text-slate-600">{t.kcalPerDay}</div>
                </div>
                <div className={`rounded-3xl border p-6 text-center border-blue-300 bg-blue-50`}>
                  <div className="text-xs font-black uppercase text-blue-700">{t.activityMultiplier}</div>
                  <div className="mt-2 text-4xl font-black text-blue-950">{activityLevels.find(a => a.key === activityLevel)?.multiplier.toFixed(3)}</div>
                  <div className="mt-1 text-sm font-black text-blue-600">{l(activityLevels.find(a => a.key === activityLevel)?.description || { zh: "", en: "" }, lang)}</div>
                </div>
                <div className={`rounded-3xl border p-6 text-center border-emerald-300 bg-emerald-50`}>
                  <div className="text-xs font-black uppercase text-emerald-700">{t.yourTDEE}</div>
                  <div className="mt-2 text-4xl font-black text-emerald-950">{activeTdee ? formatTdee(activeTdee) : "—"}</div>
                  <div className="mt-1 text-sm font-black text-emerald-600">{t.kcalPerDay}</div>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-black">{t.category}</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-black text-slate-600">{t.label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{l(activeCategory.label, lang)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-600">{t.range}</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{l(activeCategory.range, lang)}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ────── AdSense 廣告區塊 ────── */}
          <AdSenseWrapper
            showAds={true}
            adFormat="horizontal"
          />

          {/* ────── Result Intelligence ────── */}
          <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligenceBadge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.resultIntelligenceTitle}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">{t.resultIntelligenceDesc}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {categoryInfo.map((cat) => (
                <div key={cat.key} className={`rounded-2xl border p-4 ${cat.key === activeCategory.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(cat.label, lang)}</h3><span className="text-xs font-black text-slate-500">{l(cat.range, lang)}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(cat.meaning, lang)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ────── Decision Layer ────── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p>
            <h2 className="mt-2 text-3xl font-black">{t.nextStepsTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              {decisionNodes.map((node, index) => (
                <div key={`${node}-${index}`} className="contents">
                  <div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
                    <div className="text-xs font-black uppercase text-slate-500">{t.step} {index + 1}</div>
                    <div className="mt-1 text-xl font-black">{node}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{decisionDescriptions[index]}</p>
                  </div>
                  {index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ────── Knowledge ────── */}
          <section className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
              <h2 className="mt-2 text-3xl font-black">{t.tdeeKnowledgeTitle}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.semanticNeighbors}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.semanticNeighborsText}</p></div>
              </div>
              <pre className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">{t.formulaText}</pre>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
              <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
              <div className="mt-5 space-y-3">
                {faqItems.map((item) => (
                  <details key={l(item.question, lang)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer font-black">{l(item.question, lang)}</summary>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.answer, lang)}</p>
                  </details>
                ))}
              </div>
            </article>
          </section>

          {/* ────── Premium Upgrade Block ────── */}
          <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium"}</p>
            <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖完整健康追蹤" : "Unlock complete health tracking"}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[{zh: "📊 歷史記錄追蹤", en: "📊 History tracking"}, {zh: "📄 PDF 報告匯出", en: "📄 PDF export"}, {zh: "🤖 AI 個人化建議", en: "🤖 AI recommendations"}].map((feature) => (<div key={feature.zh} className="rounded-2xl bg-white p-4 text-sm font-black text-slate-800 shadow-sm">{lang === "zh" ? feature.zh : feature.en}</div>))}
            </div>
            <button className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{lang === "zh" ? "升級 Premium — 每月 NT$99" : "Upgrade Premium — $3.99/mo"}</button>
          </div>

          {/* ────── Trust & References ────── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">BMR · TDEE · {t.calories} · {lang === "zh" ? "熱量赤字" : "Calorie Deficit"} · {lang === "zh" ? "蛋白質需求" : "Protein Requirement"}</p>
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
                  <h3 className="mt-2 text-lg font-black">{lang === "zh" ? "配合 TDEE 使用的健康工具" : "Health tools to use with TDEE"}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[{zh: "健身追蹤器", en: "Fitness Tracker", href: "#affiliate-tracker"}, {zh: "蛋白質補充品", en: "Protein Powder", href: "#affiliate-protein"}, {zh: "營養計算應用", en: "Nutrition App", href: "#affiliate-app"}, {zh: "健身計畫書", en: "Fitness Plan", href: "#affiliate-plan"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
                  </div>
                  <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
                </div>
              </div>
              <div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
