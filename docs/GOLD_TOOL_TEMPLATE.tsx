// ============================================================
// GOLD TOOL TEMPLATE v1.0
// Formula Universe — 量產模板
// 使用方式：把所有 {{PLACEHOLDER}} 替換為實際內容
// 不可修改任何 JSX 結構！
// ============================================================

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";

// {{TOOL_IMPORTS}} — 如需額外 icon，在此加入

type Lang = "zh" | "en";

// ============================================================
// 替換區域 1：分類資料
// ============================================================

type CategoryInfo = {
  key: string;
  tone: string; // Tailwind gradient class
};

// {{CATEGORIES_DATA}} — 替換為實際分類陣列
// 範例格式：
// const categoryInfo = [
//   {
//     key: "low",
//     tone: "from-sky-400 via-sky-300 to-slate-200",
//   },
//   ...
// ]
const categoryInfo: CategoryInfo[] = [
  { key: "{{CATEGORY_1_KEY}}", tone: "{{CATEGORY_1_TONE}}" },
  { key: "{{CATEGORY_2_KEY}}", tone: "{{CATEGORY_2_TONE}}" },
  { key: "{{CATEGORY_3_KEY}}", tone: "{{CATEGORY_3_TONE}}" },
];

// ============================================================
// 替換區域 2：FAQ 資料（保留此結構，只換內容）
// ============================================================

type FaqItem = { question: { zh: string; en: string }; answer: { zh: string; en: string } };

const faqItems: FaqItem[] = [
  {
    question: { zh: "{{FAQ_1_Q_ZH}}", en: "{{FAQ_1_Q_EN}}" },
    answer: { zh: "{{FAQ_1_A_ZH}}", en: "{{FAQ_1_A_EN}}" },
  },
  {
    question: { zh: "{{FAQ_2_Q_ZH}}", en: "{{FAQ_2_Q_EN}}" },
    answer: { zh: "{{FAQ_2_A_ZH}}", en: "{{FAQ_2_A_EN}}" },
  },
  {
    question: { zh: "{{FAQ_3_Q_ZH}}", en: "{{FAQ_3_Q_EN}}" },
    answer: { zh: "{{FAQ_3_A_ZH}}", en: "{{FAQ_3_A_EN}}" },
  },
  {
    question: { zh: "{{FAQ_4_Q_ZH}}", en: "{{FAQ_4_Q_EN}}" },
    answer: { zh: "{{FAQ_4_A_ZH}}", en: "{{FAQ_4_A_EN}}" },
  },
  {
    question: { zh: "{{FAQ_5_Q_ZH}}", en: "{{FAQ_5_Q_EN}}" },
    answer: { zh: "{{FAQ_5_A_ZH}}", en: "{{FAQ_5_A_EN}}" },
  },
];

// ============================================================
// 替換區域 3：Affiliate 商品
// ============================================================

const affiliateItems = [
  { zh: "{{AFFILIATE_1_ZH}}", en: "{{AFFILIATE_1_EN}}", href: "#affiliate-1" },
  { zh: "{{AFFILIATE_2_ZH}}", en: "{{AFFILIATE_2_EN}}", href: "#affiliate-2" },
  { zh: "{{AFFILIATE_3_ZH}}", en: "{{AFFILIATE_3_EN}}", href: "#affiliate-3" },
  { zh: "{{AFFILIATE_4_ZH}}", en: "{{AFFILIATE_4_EN}}", href: "#affiliate-4" },
];

// ============================================================
// 語言偵測（不可修改）
// ============================================================

const getBrowserLang = (): Lang => {
  const locale = (typeof navigator !== "undefined" && navigator.language) || "zh";
  return locale.startsWith("zh") ? "zh" : "en";
};

// ============================================================
// 主元件（export function 名稱替換為實際工具名）
// ============================================================

export default function {{TOOL_COMPONENT_NAME}}() {
  const [lang, setLang] = useState<Lang>(getBrowserLang);

  // ============================================================
  // 替換區域 4：計算邏輯（只替換此區域內的計算）
  // ============================================================

  // {{INPUT_STATES}} — 替換為實際輸入狀態
  const [input1, setInput1] = useState("{{INPUT_1_DEFAULT}}");
  const [input2, setInput2] = useState("{{INPUT_2_DEFAULT}}");

  const result = useMemo(() => {
    const val1 = Number(input1);
    const val2 = Number(input2);
    if (!val1 || !val2) return null;

    // {{CALCULATION_LOGIC}} — 替換為實際計算公式
    const calculatedValue = val1 / (val2 * val2); // 範例：BMI 公式
    const category = categoryInfo[0]; // 替換為實際分類邏輯

    return { value: calculatedValue, category };
  }, [input1, input2]);

  // ============================================================
  // 文字內容（從 locales 取得，不可硬編碼）
  // ============================================================

  const t = {
    // Hero
    badge: lang === "zh" ? "{{BADGE_ZH}}" : "{{BADGE_EN}}",
    title: lang === "zh" ? "{{TITLE_ZH}}" : "{{TITLE_EN}}",
    subtitle: lang === "zh" ? "{{SUBTITLE_ZH}}" : "{{SUBTITLE_EN}}",
    intro: lang === "zh" ? "{{INTRO_ZH}}" : "{{INTRO_EN}}",
    trustNote: lang === "zh" ? "{{TRUST_NOTE_ZH}}" : "{{TRUST_NOTE_EN}}",

    // Calculator
    input1Label: lang === "zh" ? "{{INPUT_1_LABEL_ZH}}" : "{{INPUT_1_LABEL_EN}}",
    input2Label: lang === "zh" ? "{{INPUT_2_LABEL_ZH}}" : "{{INPUT_2_LABEL_EN}}",
    calculate: lang === "zh" ? "計算" : "Calculate",

    // Result
    resultLabel: lang === "zh" ? "{{RESULT_LABEL_ZH}}" : "{{RESULT_LABEL_EN}}",
    categoryLabel: lang === "zh" ? "{{CATEGORY_LABEL_ZH}}" : "{{CATEGORY_LABEL_EN}}",

    // Result Intelligence
    resultIntelligence: lang === "zh" ? "結果解讀" : "Result Intelligence",
    interpretTitle: lang === "zh" ? "{{INTERPRET_TITLE_ZH}}" : "{{INTERPRET_TITLE_EN}}",

    // Decision
    decisionTitle: lang === "zh" ? "{{DECISION_TITLE_ZH}}" : "{{DECISION_TITLE_EN}}",
    step1: lang === "zh" ? "{{STEP_1_ZH}}" : "{{STEP_1_EN}}",
    step2: lang === "zh" ? "{{STEP_2_ZH}}" : "{{STEP_2_EN}}",
    step3: lang === "zh" ? "{{STEP_3_ZH}}" : "{{STEP_3_EN}}",
    step4: lang === "zh" ? "{{STEP_4_ZH}}" : "{{STEP_4_EN}}",

    // Knowledge
    knowledgeTitle: lang === "zh" ? "{{KNOWLEDGE_TITLE_ZH}}" : "{{KNOWLEDGE_TITLE_EN}}",
    definition: lang === "zh" ? "定義" : "Definition",
    definitionText: lang === "zh" ? "{{DEFINITION_ZH}}" : "{{DEFINITION_EN}}",
    limitations: lang === "zh" ? "限制" : "Limitations",
    limitationsText: lang === "zh" ? "{{LIMITATIONS_ZH}}" : "{{LIMITATIONS_EN}}",
    relatedTools: lang === "zh" ? "相關工具" : "Related Tools",
    relatedToolsText: lang === "zh" ? "{{RELATED_TOOLS_ZH}}" : "{{RELATED_TOOLS_EN}}",
    formula: lang === "zh" ? "{{FORMULA_ZH}}" : "{{FORMULA_EN}}",

    // Trust
    trustTitle: lang === "zh" ? "信任聲明" : "Trust",
    trustText: lang === "zh" ? "{{TRUST_TEXT_ZH}}" : "{{TRUST_TEXT_EN}}",
    references: lang === "zh" ? "參考資料" : "References",
    referencesText: lang === "zh" ? "{{REFERENCES_ZH}}" : "{{REFERENCES_EN}}",

    // Affiliate
    recommendTitle: lang === "zh" ? "推薦商品" : "Recommended",
    recommendSubtitle: lang === "zh" ? "{{RECOMMEND_SUBTITLE_ZH}}" : "{{RECOMMEND_SUBTITLE_EN}}",
    affiliateDisclaimer: lang === "zh"
      ? "* 聯盟連結，購買後我們可能獲得佣金"
      : "* Affiliate links. We may earn a commission.",

    // FAQ
    faqTitle: lang === "zh" ? "常見問題" : "Common questions",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">

      {/* ── Hero ── */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">

          {/* 語言切換按鈕（不可移動） */}
          <div className="mb-6 flex justify-end">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
              <button
                onClick={() => setLang("zh")}
                className={`rounded-full px-3 py-1 text-sm font-black transition-colors ${lang === "zh" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
              >繁中</button>
              <button
                onClick={() => setLang("en")}
                className={`rounded-full px-3 py-1 text-sm font-black transition-colors ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
              >EN</button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{lang === "zh" ? "信任聲明：" : "Trust note:"}</strong> {t.trustNote}
              </div>
            </section>

            {/* Quick Action Card */}
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                {lang === "zh" ? "快速計算" : "Quick Calculate"}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {lang === "zh" ? "輸入你的數值" : "Enter your values"}
              </h2>

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-black text-slate-700">
                  {t.input1Label}
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-black text-slate-700">
                  {t.input2Label}
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                  />
                </label>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">

          {/* ── Result Card + Result Intelligence ── */}
          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${result?.category.tone ?? "from-slate-200 to-slate-300"}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                  {t.resultLabel}
                </p>
                <div className="mt-4">
                  <div className="text-7xl font-black tracking-tight text-slate-950">
                    {result ? result.value.toFixed(1) : "—"}
                  </div>
                  <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                    {result ? t.categoryLabel : lang === "zh" ? "請輸入有效數值" : "Enter valid values"}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                {t.resultIntelligence}
              </p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretTitle}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categoryInfo.map((cat) => (
                  <div
                    key={cat.key}
                    className={`rounded-2xl border p-4 ${cat.key === result?.category.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}
                  >
                    <h3 className="font-black">{cat.key}</h3>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* ── AdSense（不可移動） ── */}
          <div className="border-b border-border bg-background py-6">
            <div className="container">
              <AdSenseWrapper showAds={true} adFormat="horizontal" />
            </div>
          </div>

          {/* ── Decision Path ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              {lang === "zh" ? "決策路徑" : "Decision Path"}
            </p>
            <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              {[t.step1, t.step2, t.step3, t.step4].map((step, index) => (
                <div key={step} className="contents">
                  <div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
                    <div className="text-xs font-black uppercase text-slate-500">
                      {lang === "zh" ? `步驟 ${index + 1}` : `Step ${index + 1}`}
                    </div>
                    <div className="mt-1 text-xl font-black">{step}</div>
                  </div>
                  {index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── Knowledge ── */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              {lang === "zh" ? "知識" : "Knowledge"}
            </p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
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

          {/* ── Affiliate（不可移動） ── */}
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
