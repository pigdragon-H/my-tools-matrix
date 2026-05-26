import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";

type Lang = "zh" | "en";

type TdeeCategory = "low" | "normal" | "high";

type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: TdeeCategory;
  label: LocalText;
  tone: string;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const categoryInfo: CategoryInfo[] = [
  { key: "low", label: { zh: "低能量", en: "Low Energy" }, tone: "from-sky-400 via-sky-300 to-slate-200" },
  { key: "normal", label: { zh: "正常能量", en: "Normal Energy" }, tone: "from-emerald-500 via-lime-300 to-yellow-200" },
  { key: "high", label: { zh: "高能量", en: "High Energy" }, tone: "from-orange-400 via-red-400 to-red-600" },
];

type FaqItem = { question: { zh: string; en: string }; answer: { zh: string; en: string } };

const faqItems: FaqItem[] = [
  {
    question: { zh: "TDEE 和 BMR 有什麼差異？", en: "What is the difference between TDEE and BMR?" },
    answer: { zh: "BMR 是靜止狀態的基礎消耗，TDEE 是加入日常活動後的總消耗。TDEE = BMR × 活動係數。", en: "BMR is baseline calorie burn at rest. TDEE includes all daily activity. TDEE = BMR × activity factor." },
  },
  {
    question: { zh: "活動係數如何選擇？", en: "How do I choose the activity factor?" },
    answer: { zh: "根據你的日常活動量選擇：久坐 1.2、輕度 1.375、中度 1.55、非常活躍 1.725、極度活躍 1.9。", en: "Choose based on daily activity: sedentary 1.2, lightly active 1.375, moderate 1.55, very active 1.725, extremely active 1.9." },
  },
  {
    question: { zh: "TDEE 計算多久更新一次？", en: "How often should I recalculate TDEE?" },
    answer: { zh: "建議每 2-4 週根據實際體重變化重新計算，確保熱量規劃的準確性。", en: "Recalculate every 2-4 weeks based on actual weight changes to keep calorie planning accurate." },
  },
  {
    question: { zh: "TDEE 計算結果偏低怎麼辦？", en: "What if my TDEE calculation seems too low?" },
    answer: { zh: "可能是活動係數選擇過低。建議根據實際體重變化調整，或搭配活動追蹤器驗證。", en: "You may have selected too low an activity factor. Adjust based on weight changes or verify with an activity tracker." },
  },
  {
    question: { zh: "運動日和休息日的 TDEE 一樣嗎？", en: "Is TDEE the same on workout days and rest days?" },
    answer: { zh: "理論上不同，但 TDEE 是平均值。建議用平均活動係數計算，或分別計算兩種情況取平均。", en: "Technically different, but TDEE is an average. Use an average activity factor or calculate both scenarios separately." },
  },
];

const affiliateItems = [
  { zh: "活動追蹤器", en: "Activity Tracker", href: "#affiliate-1" },
  { zh: "營養追蹤 App", en: "Nutrition Tracker App", href: "#affiliate-2" },
  { zh: "健身計畫", en: "Fitness Plan", href: "#affiliate-3" },
  { zh: "體重計", en: "Scale", href: "#affiliate-4" },
];

const getBrowserLang = (): Lang => {
  const locale = (typeof navigator !== "undefined" && navigator.language) || "zh";
  return locale.startsWith("zh") ? "zh" : "en";
};

export default function TdeeCalculator() {
  const [lang, setLang] = useState<Lang>(getBrowserLang);

  const [input1, setInput1] = useState("1600");
  const [input2, setInput2] = useState("1.5");

  const result = useMemo(() => {
    const bmr = Number(input1);
    const activityFactor = Number(input2);
    if (!bmr || !activityFactor) return null;

    const tdee = bmr * activityFactor;
    const category = tdee < 2200 ? categoryInfo[0] :
      tdee < 3000 ? categoryInfo[1] : categoryInfo[2];

    return { value: tdee, category };
  }, [input1, input2]);

  const t = {
    badge: lang === "zh" ? "健康 · 能量規劃 · GOLD TOOL" : "Health · Energy Planning · Gold Tool",
    title: lang === "zh" ? "TDEE 每日總消耗熱量計算機" : "TDEE Total Daily Energy Expenditure Calculator",
    subtitle: lang === "zh" ? "TDEE 計算引導體驗" : "TDEE Calculator guided experience",
    intro: lang === "zh" ? "透過 BMR 和活動係數精確計算每日總消耗熱量，理解你的能量需求，並延伸到熱量赤字、體重管理等下一步工具。" : "Calculate your total daily energy expenditure using BMR and activity factors, understand your energy needs, and continue to calorie planning and weight management tools.",
    trustNote: lang === "zh" ? "TDEE 是估算工具，個人實際消耗因新陳代謝、運動強度、飲食等因素而異。建議搭配實際體重變化調整。" : "TDEE is an estimation tool. Actual energy expenditure varies by metabolism, exercise intensity, and diet. Adjust based on actual weight changes.",

    input1Label: lang === "zh" ? "BMR（kcal/天）" : "BMR (kcal/day)",
    input2Label: lang === "zh" ? "活動係數" : "Activity Factor",
    calculate: lang === "zh" ? "計算" : "Calculate",

    resultLabel: lang === "zh" ? "TDEE 結果" : "TDEE Result",
    categoryLabel: lang === "zh" ? "能量等級" : "Energy Level",

    resultIntelligence: lang === "zh" ? "結果解讀" : "Result Intelligence",
    interpretTitle: lang === "zh" ? "行動前先理解你的能量需求" : "Understand your energy needs before acting",

    decisionTitle: lang === "zh" ? "知道 TDEE 後，繼續熱量規劃路徑" : "After TDEE, continue your calorie planning path",
    step1: lang === "zh" ? "TDEE" : "TDEE",
    step2: lang === "zh" ? "熱量赤字" : "Calorie Deficit",
    step3: lang === "zh" ? "營養分配" : "Macros",
    step4: lang === "zh" ? "進度追蹤" : "Progress",

    knowledgeTitle: lang === "zh" ? "TDEE 在健康宇宙中的意義" : "What TDEE means in the Health universe",
    definition: lang === "zh" ? "定義" : "Definition",
    definitionText: lang === "zh" ? "TDEE（每日總消耗熱量）是你的身體在一整天內（包括日常活動、運動等）所消耗的總熱量。" : "TDEE is the total calories your body burns in a day, including basal metabolism, daily activity, and exercise.",
    limitations: lang === "zh" ? "限制" : "Limitations",
    limitationsText: lang === "zh" ? "TDEE 是基於平均活動係數的估算，實際消耗因個人體質、運動類型、飲食等因素而異。建議每 2-4 週根據體重變化調整。" : "TDEE is an estimate based on average activity factors. Actual expenditure varies by metabolism, exercise type, and diet. Adjust every 2-4 weeks based on weight changes.",
    relatedTools: lang === "zh" ? "相關工具" : "Related Tools",
    relatedToolsText: lang === "zh" ? "BMR、熱量赤字、BMI、蛋白質需求計算機" : "BMR, Calorie Deficit, BMI, Protein Calculator",
    formula: lang === "zh" ? "TDEE = BMR × 活動係數\n\n活動係數參考：\n- 久坐不動 (Sedentary): 1.2\n- 輕度活動 (Lightly active): 1.375\n- 中度活動 (Moderately active): 1.55\n- 非常活躍 (Very active): 1.725\n- 極度活躍 (Extremely active): 1.9" : "TDEE = BMR × Activity Factor\n\nActivity Factor Reference:\n- Sedentary: 1.2\n- Lightly active: 1.375\n- Moderately active: 1.55\n- Very active: 1.725\n- Extremely active: 1.9",

    faqTitle: lang === "zh" ? "常見問題" : "FAQ",

    trustTitle: lang === "zh" ? "信任聲明" : "Trust",
    trustText: lang === "zh" ? "本工具基於 Mifflin-St Jeor 公式計算 BMR，再乘以活動係數得出 TDEE。活動係數參考 American Council on Exercise (ACE) 標準。" : "This tool uses the Mifflin-St Jeor equation for BMR, then multiplies by activity factor per American Council on Exercise (ACE) standards.",
    references: lang === "zh" ? "參考資料" : "References",
    referencesText: lang === "zh" ? "Mifflin MD et al. (1990)、ACE 活動係數標準、NIH 能量需求指引" : "Mifflin MD et al. (1990), ACE activity factor standards, NIH energy expenditure guidelines",

    recommendTitle: lang === "zh" ? "推薦商品" : "Recommended",
    recommendSubtitle: lang === "zh" ? "配合 TDEE 使用的健康工具" : "Health tools to use with TDEE",
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
                    ? `你的 TDEE 是 ${result.value.toFixed(0)} kcal/天。這是你的身體在一整天內（包括日常活動、運動等）所消耗的總熱量。`
                    : `Your TDEE is ${result.value.toFixed(0)} kcal/day. This is the total calories your body burns in a day, including all activities.`
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
