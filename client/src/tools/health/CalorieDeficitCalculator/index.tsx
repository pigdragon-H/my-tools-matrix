import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import zhLocale from "./locales/zh";
import enLocale from "./locales/en";

const getBrowserLang = (): "zh" | "en" => {
  const locale =
    (typeof navigator !== "undefined"
    && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type GoalType = "fat_loss_slow" | "fat_loss_medium" | "fat_loss_fast" | "maintain" | "muscle_gain_slow" | "muscle_gain_medium";
type LocalText = { zh: string; en: string };

type GoalInfo = {
  key: GoalType;
  label: LocalText;
  deficit: number;
  weeklyChange: number;
  tone: string;
  type: "loss" | "maintain" | "gain";
  macroRatio: { protein: number; carb: number; fat: number };
};

const l = (value: LocalText, lang: Lang) => value[lang];

const goalInfo: GoalInfo[] = [
  {
    key: "fat_loss_slow",
    label: { zh: "緩慢減脂（-10%）", en: "Slow Fat Loss (-10%)" },
    deficit: -0.1,
    weeklyChange: -0.07,
    tone: "from-sky-400 via-sky-300 to-slate-200",
    type: "loss",
    macroRatio: { protein: 0.35, carb: 0.40, fat: 0.25 },
  },
  {
    key: "fat_loss_medium",
    label: { zh: "標準減脂（-20%）", en: "Standard Fat Loss (-20%)" },
    deficit: -0.2,
    weeklyChange: -0.14,
    tone: "from-yellow-300 via-orange-300 to-orange-500",
    type: "loss",
    macroRatio: { protein: 0.35, carb: 0.40, fat: 0.25 },
  },
  {
    key: "fat_loss_fast",
    label: { zh: "積極減脂（-25%）", en: "Aggressive Fat Loss (-25%)" },
    deficit: -0.25,
    weeklyChange: -0.18,
    tone: "from-orange-400 via-red-400 to-red-600",
    type: "loss",
    macroRatio: { protein: 0.35, carb: 0.40, fat: 0.25 },
  },
  {
    key: "maintain",
    label: { zh: "維持體重（0%）", en: "Maintain Weight (0%)" },
    deficit: 0,
    weeklyChange: 0,
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    type: "maintain",
    macroRatio: { protein: 0.25, carb: 0.50, fat: 0.25 },
  },
  {
    key: "muscle_gain_slow",
    label: { zh: "精實增肌（+10%）", en: "Lean Muscle Gain (+10%)" },
    deficit: 0.1,
    weeklyChange: 0.07,
    tone: "from-purple-400 via-pink-300 to-rose-300",
    type: "gain",
    macroRatio: { protein: 0.30, carb: 0.45, fat: 0.25 },
  },
  {
    key: "muscle_gain_medium",
    label: { zh: "積極增肌（+15%）", en: "Aggressive Muscle Gain (+15%)" },
    deficit: 0.15,
    weeklyChange: 0.11,
    tone: "from-pink-500 via-rose-400 to-orange-300",
    type: "gain",
    macroRatio: { protein: 0.30, carb: 0.45, fat: 0.25 },
  },
];

const faqItems: { question: LocalText; answer: LocalText }[] = [
  {
    question: { zh: "熱量赤字是減脂的唯一方式嗎？", en: "Is calorie deficit the only way to lose fat?" },
    answer: { zh: "是的。無論飲食類型如何，減脂的基礎是熱量赤字。不過飲食質量、蛋白質攝取與運動會影響減脂過程中的肌肉保留。", en: "Yes. Regardless of diet type, fat loss requires a calorie deficit. However, diet quality, protein intake, and exercise affect muscle preservation during fat loss." },
  },
  {
    question: { zh: "赤字越大越好嗎？", en: "Is a bigger deficit always better?" },
    answer: { zh: "不是。過大的赤字（>30%）容易導致肌肉流失、代謝適應與飢餓感。通常 -10% 到 -20% 是較平衡的選擇。", en: "No. Large deficits (>30%) often cause muscle loss, metabolic adaptation, and hunger. Usually -10% to -20% is more balanced." },
  },
  {
    question: { zh: "為什麼我的體重沒有按預估變化？", en: "Why isn't my weight changing as predicted?" },
    answer: { zh: "體重受多因素影響：水分滯留、激素週期、消化道內容物、肌肉增長、睡眠與壓力。建議用 4 週平均體重而非單日數據。", en: "Weight is affected by many factors: water retention, hormones, digestive content, muscle gain, sleep, and stress. Use 4-week average weight instead of daily data." },
  },
  {
    question: { zh: "增肌時需要熱量盈餘嗎？", en: "Do I need a calorie surplus to gain muscle?" },
    answer: { zh: "通常是的。小幅盈餘（+10% 到 +15%）配合阻力訓練能促進肌肉合成，但過大盈餘會增加脂肪增長。", en: "Usually yes. Small surplus (+10% to +15%) combined with resistance training promotes muscle growth, but large surplus increases fat gain." },
  },
  {
    question: { zh: "我應該多久檢查一次進度？", en: "How often should I check progress?" },
    answer: { zh: "建議每週量體重 3-5 次，然後計算週平均。每 4 週評估一次進度，根據結果調整熱量目標。", en: "Weigh yourself 3-5 times per week and calculate weekly average. Evaluate progress every 4 weeks and adjust calorie target based on results." },
  },
  {
    question: { zh: "計算完後我該做什麼？", en: "What should I do after calculating?" },
    answer: { zh: "先確認 BMR 與 TDEE 的準確性，然後根據目標調整飲食。建議搭配體脂率、腰圍等指標進行更完整評估。", en: "Verify BMR and TDEE accuracy first, then adjust diet based on goals. Combine with body fat percentage and waist circumference for complete assessment." },
  },
];

const decisionNodes = [
  { zh: "計算 TDEE", en: "Calculate TDEE" },
  { zh: "設定赤字", en: "Set Deficit" },
  { zh: "分配營養", en: "Distribute Macros" },
  { zh: "追蹤進度", en: "Track Progress" },
];

export default function CalorieDeficitCalculator() {
  const [lang, setLang] = useState<Lang>(getBrowserLang());
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [tdee, setTdee] = useState<string>("2000");
  const [weight, setWeight] = useState<string>("70");
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("fat_loss_medium");
  const [result, setResult] = useState<{
    tdee: number;
    targetCalories: number;
    deficit: number;
    weeklyChange: number;
    monthlyChange: number;
    protein: number;
    carb: number;
    fat: number;
    goal: GoalType;
  } | null>(null);

  const t = lang === "zh" ? zhLocale : enLocale;
  const currentGoal = goalInfo.find((g) => g.key === selectedGoal);

  const handleCalculate = () => {
    const tdeeNum = Number(tdee);
    const weightNum = Number(weight);

    if (isNaN(tdeeNum) || tdeeNum < 800 || tdeeNum > 10000) {
      alert(lang === "zh" ? "請輸入 800～10000 的 TDEE" : "Please enter TDEE between 800 and 10000");
      return;
    }
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      alert(lang === "zh" ? "請輸入 20～300 的體重" : "Please enter weight between 20 and 300");
      return;
    }

    const goal = goalInfo.find((g) => g.key === selectedGoal)!;
    const targetCals = Math.round(tdeeNum * (1 + goal.deficit));
    const deficitCals = Math.round(tdeeNum * goal.deficit);
    const weeklyChg = Math.round(goal.weeklyChange * 100) / 100;
    const monthlyChg = Math.round(weeklyChg * 4.3 * 100) / 100;

    const ratio = goal.macroRatio;
    const proteinG = Math.round((targetCals * ratio.protein) / 4);
    const carbG = Math.round((targetCals * ratio.carb) / 4);
    const fatG = Math.round((targetCals * ratio.fat) / 9);

    setResult({
      tdee: tdeeNum,
      targetCalories: targetCals,
      deficit: deficitCals,
      weeklyChange: weeklyChg,
      monthlyChange: monthlyChg,
      protein: proteinG,
      carb: carbG,
      fat: fatG,
      goal: selectedGoal,
    });
  };

  const mealDistribution = useMemo(() => {
    if (!result) return [];
    return [
      { meal: t.breakfast, ratio: 0.25 },
      { meal: t.lunch, ratio: 0.35 },
      { meal: t.dinner, ratio: 0.30 },
      { meal: t.snacks, ratio: 0.10 },
    ];
  }, [result, t]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 md:py-12">
      <div className="container max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.badge}</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">{t.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.intro}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLang("zh")}
              className={`rounded-lg px-3 py-1 text-sm font-bold transition ${lang === "zh" ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-700"}`}
            >
              中文
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-lg px-3 py-1 text-sm font-bold transition ${lang === "en" ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-700"}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Trust Note */}
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustNoteLabel}</p>
          <p className="mt-2 text-sm text-amber-900">{t.trustNote}</p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Calculator Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.calculator}</p>
            <h2 className="mt-2 text-2xl font-black">{t.enterOrFillValues}</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700">{t.tdeeValue}</label>
                <input
                  type="number"
                  value={tdee}
                  onChange={(e) => setTdee(e.target.value)}
                  placeholder="2000"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">{t.currentWeight}</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">{t.goal}</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value as GoalType)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                >
                  {goalInfo.map((g) => (
                    <option key={g.key} value={g.key}>
                      {l(g.label, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white transition hover:bg-orange-700"
              >
                {t.calculateButton}
              </button>
            </div>

            {/* Result Summary */}
            {result && currentGoal && (
              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t.yourTdee}</span>
                  <span className="font-bold">{result.tdee} {t.calories}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t.dailyTargetCalories}</span>
                  <span className="font-bold text-orange-600">{result.targetCalories} {t.calories}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{currentGoal.type === "loss" ? t.calorieDeficit : currentGoal.type === "gain" ? t.caloriesSurplus : t.caloriesDifference}</span>
                  <span className="font-bold">{Math.abs(result.deficit)} {t.perDay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t.estimatedWeeklyChange}</span>
                  <span className="font-bold">{result.weeklyChange > 0 ? "+" : ""}{result.weeklyChange} {t.kg}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t.estimatedMonthlyChange}</span>
                  <span className="font-bold">{result.monthlyChange > 0 ? "+" : ""}{result.monthlyChange} {t.kg}</span>
                </div>
              </div>
            )}
          </div>

          {/* Macro Distribution Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.macroDistribution}</p>
            <h2 className="mt-2 text-2xl font-black">{t.macroDistribution}</h2>

            {!result ? (
              <div className="mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-300">
                <p className="text-sm text-slate-500">{t.enterValidValues}</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {/* Macro Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t.protein, value: result.protein, color: "bg-blue-50 text-blue-700", barColor: "bg-blue-500" },
                    { label: t.carbs, value: result.carb, color: "bg-amber-50 text-amber-700", barColor: "bg-amber-500" },
                    { label: t.fat, value: result.fat, color: "bg-emerald-50 text-emerald-700", barColor: "bg-emerald-500" },
                  ].map((m) => (
                    <div key={m.label} className={`rounded-lg ${m.color} p-4 text-center`}>
                      <div className="text-2xl font-black">{m.value}g</div>
                      <div className="mt-1 text-xs font-bold">{m.label}</div>
                      <div className="mt-1 text-xs text-slate-600">{Math.round((m.value * (m.label === t.protein ? 4 : m.label === t.carbs ? 4 : 9)))} {t.calories}</div>
                    </div>
                  ))}
                </div>

                {/* Macro Bar */}
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span>{t.dailyTargetCalories}</span>
                    <span className="text-orange-600">{result.targetCalories} {t.calories}</span>
                  </div>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500" style={{ width: `${(result.protein * 4) / result.targetCalories * 100}%` }} />
                    <div className="bg-amber-500" style={{ width: `${(result.carb * 4) / result.targetCalories * 100}%` }} />
                    <div className="bg-emerald-500" style={{ width: `${(result.fat * 9) / result.targetCalories * 100}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs font-bold">
                    <span className="text-blue-600">{t.protein} {Math.round((result.protein * 4) / result.targetCalories * 100)}%</span>
                    <span className="text-amber-600">{t.carbs} {Math.round((result.carb * 4) / result.targetCalories * 100)}%</span>
                    <span className="text-emerald-600">{t.fat} {Math.round((result.fat * 9) / result.targetCalories * 100)}%</span>
                  </div>
                </div>

                {/* Meal Distribution */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-black">{t.mealDistribution}</p>
                  {mealDistribution.map((m) => (
                    <div key={m.meal} className="flex justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      <span className="font-bold">{m.meal}</span>
                      <div className="text-right">
                        <div className="font-bold">{Math.round(result.targetCalories * m.ratio)} {t.calories}</div>
                        <div className="text-xs text-slate-600">
                          P: {Math.round(result.protein * m.ratio)}g | C: {Math.round(result.carb * m.ratio)}g | F: {Math.round(result.fat * m.ratio)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decision Path */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.highDeficitEnergyPath}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {decisionNodes.map((node, index) => (
              <div key={`${l(node, lang)}-${index}`} className="contents">
                <div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
                  <div className="text-xs font-black uppercase text-slate-500">{t.step} {index + 1}</div>
                  <div className="mt-1 text-xl font-black">{l(node, lang)}</div>
                </div>
                {index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Knowledge & FAQ */}
        <section className="mt-10 grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.calorieDeficitMeaning}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.definition}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.limitations}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.semanticNeighbors}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.semanticNeighborsText}</p>
              </div>
            </div>
            <pre className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">{t.metricFormula}{"\n"}{t.imperialFormula}</pre>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.faq}</p>
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

        {/* Result Intelligence - AdSense 廣告插入位置 */}
        {result && (
          <div className="mt-10">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{lang === "zh" ? "結果解讀" : "Result Intelligence"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "您的熱量目標解讀" : "Your Calorie Target Interpretation"}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                {lang === "zh" 
                  ? `根據您的 TDEE ${result.tdee} 大卡和 ${l(goalInfo.find(g => g.key === result.goal)?.label || { zh: "", en: "" }, lang)} 目標，您的每日目標熱量為 ${result.targetCalories} 大卡。這相當於每天的 ${Math.abs(result.deficit)} 大卡 ${result.deficit < 0 ? "缺口" : "盈餘"}，預計每週體重變化約 ${result.weeklyChange > 0 ? "+" : ""}${result.weeklyChange} kg。`
                  : `Based on your TDEE of ${result.tdee} kcal and ${l(goalInfo.find(g => g.key === result.goal)?.label || { zh: "", en: "" }, lang)} goal, your daily target calories are ${result.targetCalories} kcal. This represents a daily ${Math.abs(result.deficit)} kcal ${result.deficit < 0 ? "deficit" : "surplus"}, with estimated weekly weight change of ${result.weeklyChange > 0 ? "+" : ""}${result.weeklyChange} kg.`
                }
              </p>
            </div>
            {/* AdSense 廣告區塊 - 只在 Result Intelligence 下方 */}
            <AdSenseWrapper showAds={true} adFormat="horizontal" />
          </div>
        )}

        {/* Premium Block */}
        <div className="mt-10 rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium"}</p>
          <h2 className="mt-2 text-2xl font-black">{t.premiumTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[t.premiumFeature1, t.premiumFeature2, t.premiumFeature3].map((feature) => (
              <div key={feature} className="rounded-2xl bg-white p-4 text-sm font-black text-slate-800 shadow-sm">
                {feature}
              </div>
            ))}
          </div>
          <button className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">
            {t.upgradePremium}
          </button>
        </div>

        {/* Trust & References + Affiliate */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.trustRelatedReferences}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div>
              <h2 className="text-xl font-black">{t.trust}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p>
            </div>
            <div>
              <h2 className="text-xl font-black">{t.relatedTools}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{t.recommendedTools}</p>
              {/* Affiliate 推薦商品區塊 */}
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
                <h3 className="mt-2 text-lg font-black">{lang === "zh" ? "配合熱量計算使用的營養工具" : "Nutrition tools to use with calorie planning"}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[{zh: "食物秤", en: "Food Scale", href: "#affiliate-scale"}, {zh: "營養補充品", en: "Supplements", href: "#affiliate-supplements"}, {zh: "健身手環", en: "Fitness Band", href: "#affiliate-band"}, {zh: "營養指南", en: "Nutrition Guide", href: "#affiliate-guide"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
                </div>
                <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black">{t.references}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
