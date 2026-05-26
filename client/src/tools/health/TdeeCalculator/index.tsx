import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";

type Lang = "zh" | "en";

type TdeeCategory = "sedentary" | "light" | "moderate" | "active" | "veryactive";

type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: TdeeCategory;
  label: LocalText;
  tone: string;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const categoryInfo: CategoryInfo[] = [
  { key: "sedentary", label: { zh: "久坐", en: "Sedentary" }, tone: "from-slate-300 via-slate-200 to-slate-100" },
  { key: "light", label: { zh: "輕度活動", en: "Light Activity" }, tone: "from-sky-400 via-sky-300 to-slate-200" },
  { key: "moderate", label: { zh: "中度活動", en: "Moderate Activity" }, tone: "from-emerald-500 via-lime-300 to-yellow-200" },
  { key: "active", label: { zh: "高度活動", en: "Active" }, tone: "from-yellow-300 via-orange-300 to-orange-500" },
  { key: "veryactive", label: { zh: "非常高度", en: "Very Active" }, tone: "from-orange-400 via-red-400 to-red-600" },
];

type FaqItem = { question: { zh: string; en: string }; answer: { zh: string; en: string } };

const faqItems: FaqItem[] = [
  {
    question: { zh: "TDEE 和 BMR 哪個更重要？", en: "Which is more important, TDEE or BMR?" },
    answer: { zh: "兩者都重要。BMR 是基礎，TDEE 才是你實際需要的熱量。飲食計畫應以 TDEE 為基準，而非 BMR。", en: "Both matter. BMR is the foundation, but TDEE is what you actually need. Base your diet plan on TDEE, not BMR." },
  },
  {
    question: { zh: "為什麼計算 TDEE 後還是瘦不下來？", en: "Why am I not losing weight despite calculating TDEE?" },
    answer: { zh: "常見原因：高估活動量、低估飲食熱量、代謝適應。建議從 TDEE - 300 kcal 開始，每兩週檢視體重變化。", en: "Common reasons: overestimating activity, underestimating food intake, metabolic adaptation. Start with TDEE - 300 kcal and review every 2 weeks." },
  },
  {
    question: { zh: "運動後 TDEE 會立刻改變嗎？", en: "Does TDEE change immediately after exercise?" },
    answer: { zh: "單次運動會增加當天消耗，但 TDEE 計算的是長期平均活動水平。建議每月重新評估活動係數。", en: "Single workouts increase daily burn, but TDEE reflects long-term average activity. Reassess your activity factor monthly." },
  },
  {
    question: { zh: "如何選擇正確的活動係數？", en: "How do I choose the right activity factor?" },
    answer: { zh: "建議低估而非高估。若不確定，選擇比實際感覺低一個等級的係數，避免高估消耗而攝取過多。", en: "When unsure, choose one level lower than you think. This prevents overestimating expenditure and eating too much." },
  },
  {
    question: { zh: "TDEE 需要多久重新計算一次？", en: "How often should I recalculate TDEE?" },
    answer: { zh: "建議每3個月，或體重變化超過5kg、運動習慣大幅改變時重新計算。", en: "Recalculate every 3 months, or when weight changes by 5kg or exercise habits change significantly." },
  },
];

const affiliateItems = [
  { zh: "健身追蹤器", en: "Fitness Tracker", href: "#affiliate-1" },
  { zh: "智能體重秤", en: "Smart Scale", href: "#affiliate-2" },
  { zh: "運動手環", en: "Sports Band", href: "#affiliate-3" },
  { zh: "營養計畫書", en: "Nutrition Plan", href: "#affiliate-4" },
];

const getBrowserLang = (): Lang => {
  const locale = (typeof navigator !== "undefined" && navigator.language) || "zh";
  return locale.startsWith("zh") ? "zh" : "en";
};

export default function TdeeCalculator() {
  const [lang, setLang] = useState<Lang>(getBrowserLang);

  const [input1, setInput1] = useState("1600");
  const [input2, setInput2] = useState("1.55");

  const result = useMemo(() => {
    const bmr = Number(input1);
    const factor = Number(input2);
    if (!bmr || !factor || bmr <= 0 || factor <= 0) return null;

    const tdee = bmr * factor;
    const category = factor <= 1.2 ? categoryInfo[0] :
      factor <= 1.375 ? categoryInfo[1] :
      factor <= 1.55 ? categoryInfo[2] :
      factor <= 1.725 ? categoryInfo[3] : categoryInfo[4];

    return { value: tdee, category };
  }, [input1, input2]);

  const t = {
    badge: lang === "zh" ? "健康 · 生物指標 · GOLD TOOL" : "Health · Biometrics · Gold Tool",
    title: lang === "zh" ? "TDEE 每日總消耗計算機" : "TDEE Total Daily Energy Expenditure Calculator",
    subtitle: lang === "zh" ? "TDEE 計算引導體驗" : "TDEE Calculator guided experience",
    intro: lang === "zh" ? "透過 TDEE 了解你每天真正消耗的熱量，設定正確的飲食目標，延伸到熱量赤字、增肌計畫等下一步工具。" : "Calculate your total daily energy expenditure to set accurate nutrition goals and continue to calorie deficit or muscle gain planning.",
    trustNote: lang === "zh" ? "TDEE 是估算工具，活動係數因個人差異而異。建議每3個月重新計算一次。" : "TDEE is an estimation tool. Activity factors vary by individual. Recalculate every 3 months.",

    input1Label: lang === "zh" ? "BMR（大卡）" : "BMR (kcal)",
    input2Label: lang === "zh" ? "活動係數" : "Activity Factor",
    calculate: lang === "zh" ? "計算" : "Calculate",

    resultLabel: lang === "zh" ? "TDEE 結果" : "TDEE Result",
    categoryLabel: lang === "zh" ? "活動等級" : "Activity Level",

    resultIntelligence: lang === "zh" ? "結果解讀" : "Result Intelligence",
    interpretTitle: lang === "zh" ? "了解你的每日能量消耗" : "Understand your daily energy expenditure",

    decisionTitle: lang === "zh" ? "知道 TDEE 後，制定你的飲食計畫" : "After TDEE, plan your nutrition strategy",
    step1: lang === "zh" ? "TDEE" : "TDEE",
    step2: lang === "zh" ? "設定目標" : "Set Goal",
    step3: lang === "zh" ? "熱量赤字/盈餘" : "Calorie Deficit/Surplus",
    step4: lang === "zh" ? "追蹤進度" : "Track Progress",

    knowledgeTitle: lang === "zh" ? "TDEE 在健康宇宙中的意義" : "What TDEE means in the Health universe",
    definition: lang === "zh" ? "定義" : "Definition",
    definitionText: lang === "zh" ? "TDEE（每日總消耗）是你在日常活動下一天實際消耗的總熱量，等於 BMR 乘以活動係數。" : "TDEE (Total Daily Energy Expenditure) is the total calories you burn in a day including all activities. TDEE = BMR × Activity Factor.",
    limitations: lang === "zh" ? "限制" : "Limitations",
    limitationsText: lang === "zh" ? "活動係數為估算值，個人差異可達 ±200 kcal。壓力、睡眠品質也會影響實際消耗。" : "Activity factors are estimates with ±200 kcal individual variation. Stress and sleep quality also affect actual expenditure.",
    relatedTools: lang === "zh" ? "相關工具" : "Related Tools",
    relatedToolsText: lang === "zh" ? "BMR、熱量赤字、BMI、蛋白質需求計算機" : "BMR, Calorie Deficit, BMI, Protein Calculator",
    formula: lang === "zh" ? "TDEE = BMR × 活動係數\n久坐（幾乎不運動）：× 1.2\n輕度（每週1-3天）：× 1.375\n中度（每週3-5天）：× 1.55\n高度（每週6-7天）：× 1.725\n非常高度（體力勞動）：× 1.9" : "TDEE = BMR × Activity Factor\nSedentary: × 1.2\nLight (1-3 days/week): × 1.375\nModerate (3-5 days/week): × 1.55\nActive (6-7 days/week): × 1.725\nVery Active (hard labor): × 1.9",

    faqTitle: lang === "zh" ? "常見問題" : "FAQ",

    trustTitle: lang === "zh" ? "信任聲明" : "Trust",
    trustText: lang === "zh" ? "本工具基於 Harris-Benedict 與 Mifflin-St Jeor 的活動係數標準，為運動科學界廣泛採用。" : "This tool uses activity factors based on Harris-Benedict and Mifflin-St Jeor standards, widely adopted in exercise science.",
    references: lang === "zh" ? "參考資料" : "References",
    referencesText: lang === "zh" ? "Mifflin MD et al. (1990)、Harris & Benedict (1919)、NIH 熱量需求指引" : "Mifflin MD et al. (1990), Harris & Benedict (1919), NIH caloric needs guidelines",

    recommendTitle: lang === "zh" ? "推薦商品" : "Recommended",
    recommendSubtitle: lang === "zh" ? "配合 TDEE 使用的健身工具" : "Fitness tools to use with TDEE",
    affiliateDisclaimer: lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission.",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* ── Hero ── */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.badge}</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">{t.title}</h1>
          <p className="mt-2 text-sm font-black text-slate-500">{t.subtitle}</p>
          <p className="mt-4 text-sm leading-6 text-slate-700">{t.intro}</p>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{t.trustNote}</p>

          {/* Language Toggle */}
          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
              <button
                onClick={() => setLang("zh")}
                className={`rounded-full px-3 py-1 text-sm font-black transition-colors
                  ${lang === "zh" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
              >繁中</button>
              <button
                onClick={() => setLang("en")}
                className={`rounded-full px-3 py-1 text-sm font-black transition-colors
                  ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
              >EN</button>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          {/* ── Calculator ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{lang === "zh" ? "計算機" : "Calculator"}</p>
            <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "計算你的 TDEE" : "Calculate Your TDEE"}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700">{t.input1Label}</label>
                <input
                  type="number"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900"
                  min="800"
                  max="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700">{t.input2Label}</label>
                <input
                  type="number"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900"
                  min="1.2"
                  max="1.9"
                  step="0.05"
                />
              </div>
              <button
                onClick={() => {}}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                {t.calculate}
              </button>
            </div>
          </section>

          {/* ── Result ── */}
          {result && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultLabel}</p>
              <h2 className="mt-2 text-3xl font-black">{result.value.toFixed(0)} kcal/day</h2>
              <div className={`mt-4 rounded-2xl bg-gradient-to-br ${result.category.tone} p-6`}>
                <p className="text-sm font-black text-slate-700">{t.categoryLabel}</p>
                <p className="mt-2 text-2xl font-black">{l(result.category.label, lang)}</p>
              </div>
            </section>
          )}

          {/* ── Result Intelligence ── */}
          {result && (
            <div className="mt-10">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultIntelligence}</p>
                <h2 className="mt-2 text-2xl font-black">{t.interpretTitle}</h2>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {lang === "zh"
                    ? `你的 TDEE 是 ${result.value.toFixed(0)} kcal/天。這是你在日常活動下一天實際消耗的總熱量。`
                    : `Your TDEE is ${result.value.toFixed(0)} kcal/day. This is the total calories you burn in a day including all activities.`
                  }
                </p>
              </div>
              {/* AdSense 廣告區塊 */}
              <AdSenseWrapper showAds={true} adFormat="horizontal" />
            </div>
          )}

          {/* ── Decision ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-700">{lang === "zh" ? "決策路徑" : "Decision Path"}</p>
            <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:gap-2">
              {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
                <div key={i} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-black">
                  {step}
                </div>
              ))}
            </div>
          </section>

          {/* ── Knowledge ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledgeTitle}</p>
            <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "知識中心" : "Knowledge Hub"}</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.definition}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.limitations}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black">{t.relatedTools}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p>
              </div>
            </div>
            <pre className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
              {t.formula}
            </pre>
          </section>

          {/* ── FAQ ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-black">{t.faqTitle}</h2>
            <div className="mt-5 space-y-3">
              {faqItems.map((item) => (
                <details key={item.question.zh} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-black">
                    {lang === "zh" ? item.question.zh : item.question.en}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {lang === "zh" ? item.answer.zh : item.answer.en}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Affiliate ── */}
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.recommendTitle}</p>
            <h3 className="mt-2 text-2xl font-black">{t.recommendSubtitle}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {affiliateItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100"
                >
                  {lang === "zh" ? item.zh : item.en}
                </a>
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-600">{t.affiliateDisclaimer}</p>
          </section>

          {/* ── Trust ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              {lang === "zh" ? "信任聲明 · 參考資料" : "Trust · References"}
            </p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-black">{t.trustTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p>
              </div>
              <div>
                <h2 className="text-xl font-black">{t.references}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
