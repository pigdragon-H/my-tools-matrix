import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";

type Lang = "zh" | "en";

type BmrCategory = "low" | "normal" | "high";

type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: BmrCategory;
  label: LocalText;
  tone: string;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const categoryInfo: CategoryInfo[] = [
  { key: "low", label: { zh: "偏低", en: "Low" }, tone: "from-sky-400 via-sky-300 to-slate-200" },
  { key: "normal", label: { zh: "正常", en: "Normal" }, tone: "from-emerald-500 via-lime-300 to-yellow-200" },
  { key: "high", label: { zh: "偏高", en: "High" }, tone: "from-orange-400 via-red-400 to-red-600" },
];

type FaqItem = { question: { zh: string; en: string }; answer: { zh: string; en: string } };

const faqItems: FaqItem[] = [
  {
    question: { zh: "BMR 和 TDEE 有什麼差異？", en: "What is the difference between BMR and TDEE?" },
    answer: { zh: "BMR 是靜止狀態的基礎消耗，TDEE 是加入日常活動後的總消耗。TDEE = BMR × 活動係數。", en: "BMR is your baseline calorie burn at rest. TDEE includes daily activity. TDEE = BMR × activity factor." },
  },
  {
    question: { zh: "BMR 會隨年齡下降嗎？", en: "Does BMR decrease with age?" },
    answer: { zh: "是的，每10年約下降1-2%。主要原因是肌肉量減少，阻力訓練可以減緩下降速度。", en: "Yes, BMR decreases about 1-2% per decade, mainly due to muscle loss. Resistance training can slow this decline." },
  },
  {
    question: { zh: "節食會降低 BMR 嗎？", en: "Does dieting lower BMR?" },
    answer: { zh: "長期嚴格節食確實會降低 BMR，稱為「代謝適應」。建議赤字不超過 500 kcal/天。", en: "Prolonged severe dieting can lower BMR through metabolic adaptation. Keep deficit under 500 kcal/day." },
  },
  {
    question: { zh: "肌肉訓練能提升 BMR 嗎？", en: "Can muscle training increase BMR?" },
    answer: { zh: "是的。每增加 1kg 肌肉，BMR 約提升 13 kcal/天。這是長期提高代謝最有效的方法。", en: "Yes. Each 1kg of muscle adds approximately 13 kcal/day to BMR. This is the most effective long-term metabolism booster." },
  },
  {
    question: { zh: "BMR 計算需要多久更新一次？", en: "How often should I recalculate BMR?" },
    answer: { zh: "建議每3個月或體重變化超過5kg時重新計算，確保熱量規劃的準確性。", en: "Recalculate every 3 months or when weight changes by more than 5kg to keep your calorie planning accurate." },
  },
];

const affiliateItems = [
  { zh: "智能體重秤", en: "Smart Scale", href: "#affiliate-1" },
  { zh: "體脂計", en: "Body Fat Monitor", href: "#affiliate-2" },
  { zh: "蛋白質補充品", en: "Protein Supplement", href: "#affiliate-3" },
  { zh: "健身計畫書", en: "Fitness Plan", href: "#affiliate-4" },
];

const getBrowserLang = (): Lang => {
  const locale = (typeof navigator !== "undefined" && navigator.language) || "zh";
  return locale.startsWith("zh") ? "zh" : "en";
};

export default function BmrCalculator() {
  const [lang, setLang] = useState<Lang>(getBrowserLang);

  const [input1, setInput1] = useState("70");
  const [input2, setInput2] = useState("175");

  const result = useMemo(() => {
    const weight = Number(input1);
    const height = Number(input2);
    const age = 35;
    if (!weight || !height) return null;

    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const category = bmr < 1400 ? categoryInfo[0] :
      bmr < 1800 ? categoryInfo[1] : categoryInfo[2];

    return { value: bmr, category };
  }, [input1, input2]);

  const t = {
    badge: lang === "zh" ? "健康 · 生物指標 · GOLD TOOL" : "Health · Biometrics · Gold Tool",
    title: lang === "zh" ? "BMR 基礎代謝率計算機" : "BMR Basal Metabolic Rate Calculator",
    subtitle: lang === "zh" ? "BMR 計算引導體驗" : "BMR Calculator guided experience",
    intro: lang === "zh" ? "透過 Mifflin-St Jeor 公式精確計算靜止代謝率，理解你的身體基礎熱量需求，並延伸到 TDEE、熱量赤字等下一步工具。" : "Calculate your resting metabolic rate using the Mifflin-St Jeor formula, understand your body's baseline caloric needs, and continue to TDEE and calorie planning tools.",
    trustNote: lang === "zh" ? "BMR 是估算工具，個人實際代謝因體組成、健康狀況而異。孕婦及特殊疾病患者請諮詢醫師。" : "BMR is an estimation tool. Actual metabolism varies by body composition and health status. Consult a doctor if pregnant or have medical conditions.",

    input1Label: lang === "zh" ? "體重（kg）" : "Weight (kg)",
    input2Label: lang === "zh" ? "身高（cm）" : "Height (cm)",
    calculate: lang === "zh" ? "計算" : "Calculate",

    resultLabel: lang === "zh" ? "BMR 結果" : "BMR Result",
    categoryLabel: lang === "zh" ? "代謝等級" : "Metabolic Level",

    resultIntelligence: lang === "zh" ? "結果解讀" : "Result Intelligence",
    interpretTitle: lang === "zh" ? "行動前先理解你的代謝等級" : "Understand your metabolic level before acting",

    decisionTitle: lang === "zh" ? "知道 BMR 後，繼續能量規劃路徑" : "After BMR, continue your energy planning path",
    step1: lang === "zh" ? "BMR" : "BMR",
    step2: lang === "zh" ? "TDEE" : "TDEE",
    step3: lang === "zh" ? "熱量赤字" : "Calorie Deficit",
    step4: lang === "zh" ? "進度追蹤" : "Progress",

    knowledgeTitle: lang === "zh" ? "BMR 在健康宇宙中的意義" : "What BMR means in the Health universe",
    definition: lang === "zh" ? "定義" : "Definition",
    definitionText: lang === "zh" ? "BMR（基礎代謝率）是你的身體在完全靜止狀態下維持生命功能所需的最低熱量。" : "BMR is the minimum calories your body needs to maintain vital functions at complete rest.",
    limitations: lang === "zh" ? "限制" : "Limitations",
    limitationsText: lang === "zh" ? "BMR 不考慮日常活動、運動、壓力或荷爾蒙變化。肌肉量高者 BMR 會偏高。" : "BMR does not account for daily activity, exercise, stress, or hormonal changes. Higher muscle mass increases BMR.",
    relatedTools: lang === "zh" ? "相關工具" : "Related Tools",
    relatedToolsText: lang === "zh" ? "TDEE、熱量赤字、BMI、蛋白質需求計算機" : "TDEE, Calorie Deficit, BMI, Protein Calculator",
    formula: lang === "zh" ? "男性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 + 5\n女性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 - 161" : "Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5\nFemale: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161",

    faqTitle: lang === "zh" ? "常見問題" : "FAQ",

    trustTitle: lang === "zh" ? "信任聲明" : "Trust",
    trustText: lang === "zh" ? "本工具基於 Mifflin-St Jeor 公式，為目前學術界最廣泛採用的 BMR 計算標準。" : "This tool uses the Mifflin-St Jeor equation, the most widely validated BMR formula in current research.",
    references: lang === "zh" ? "參考資料" : "References",
    referencesText: lang === "zh" ? "Mifflin MD et al. (1990)、WHO 代謝標準、NIH 熱量需求指引" : "Mifflin MD et al. (1990), WHO metabolic standards, NIH caloric needs guidelines",

    recommendTitle: lang === "zh" ? "推薦商品" : "Recommended",
    recommendSubtitle: lang === "zh" ? "配合 BMR 使用的健康工具" : "Health tools to use with BMR",
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
            <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "計算你的 BMR" : "Calculate Your BMR"}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700">{t.input1Label}</label>
                <input
                  type="number"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900"
                  min="20"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700">{t.input2Label}</label>
                <input
                  type="number"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900"
                  min="100"
                  max="250"
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
                    ? `你的 BMR 是 ${result.value.toFixed(0)} kcal/天。這是你的身體在完全靜止狀態下維持生命功能所需的最低熱量。`
                    : `Your BMR is ${result.value.toFixed(0)} kcal/day. This is the minimum calories your body needs to maintain vital functions at rest.`
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
